import { IMarket, IMarketFilter, IMarketPublic, IMarketList } from "../interfaces/market.interface";
import { Market } from "../models/market.model";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { SelectionService } from "../../selections/services/selection.service";
import { broker, BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { IMessage } from "../../../../../CommonJS/src/messaging/message.interface";
import { ICategory } from "../../../../../CategoryService/src/components/category/interfaces/category.interface";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { MarketFilter } from "../filters/market_admin.filter";
import { MarketSettingsService } from "../../market_settings/services/market_settings.service";
import { MarketOrderService } from "../../market_order/services/market_order.service";
import { MarketNameService } from "../../market_name/services/market_name.service";
import { MarketCMSService } from "../../market_cms/services/market_cms.service";
import { MarketDynamicLimitService } from "../../market_dynamic_limit/services/market_dynamic_limit.service";
import { isNotNumber, toBoolean } from "../../../../../CommonJS/src/utils/validators";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { IMarketSettings } from "../../market_settings/interfaces/market_settings.interface";
import { IMarketTranslation } from "../../market_name/interfaces/market_name.interface";
import { IMarketOrder } from "../../market_order/interfaces/market_order.interfaces";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";
import { BetSlipStatus } from "../../../../../BetSlipService/src/components/betslip/enums/betslip_status.enum";
import { IDeleteResponse } from "../../../../../CommonJS/src/interfaces/cancel.interface";
import { BaseModelWithLogger } from "../../../../../CommonJS/src/base/baseWithLoger.model";
import { HistoryActionType } from "../../../../../HistoryService/src/common/enums/history_action_type.enum";
import { isUndefined, isString } from "util";
import { cloneDeep, concat, difference, isNil } from "lodash";
import { merge, toNumber, isEqual } from "lodash";
import { each, map } from "bluebird";
import { MarketOrder } from "../../market_order/models/market_order.model";
import { MarketTranslation } from "../../market_name/models/market_name.model";
import { MarketDynamicLimit } from "../../market_dynamic_limit/models/market_dynamic_limit.model";
import { Selection } from "../../selections/models/selection.model";
import { MarketNameFilter } from "../../market_name/filters/market_name.filter";
import { ISelectionOrder } from "../../selection_order/interfaces/selection_order.interface";
import { ISelectionTranslation } from "../../selection_name/interfaces/selection_name.interface";
import { ISelectionList } from "../../selections/interfaces/selection.interface";
import { SelectionFilter } from "../../selections/filters/selection.filter";
import { SelectionOrderFilter } from "../../selection_order/filters/selection_order.filter";
import { SelectionNameFilter } from "../../selection_name/filters/selection_name.filter";
import { MarketOrderFilter } from "../../market_order/filters/market_order.filter";
import { IEventMarket } from "../../../../../EventService/src/components/event.market/interfaces/event.market.interface";

export class MarketService extends ServiceWithRequestInfo {
    private selectionService = new SelectionService();
    private marketSettingsService = new MarketSettingsService();
    private marketOrderService = new MarketOrderService();
    private marketNameService = new MarketNameService();
    private marketCMSService = new MarketCMSService();
    private marketDynamicLimitService = new MarketDynamicLimitService();

    public setRequestInfo(data: IMessage) {
        super.setRequestInfo(data);
        this.selectionService.setRequestInfo(data);
        this.marketSettingsService.setRequestInfo(data);
        this.marketOrderService.setRequestInfo(data);
        this.marketNameService.setRequestInfo(data);
        this.marketCMSService.setRequestInfo(data);
        this.marketDynamicLimitService.setRequestInfo(data);
    }

    public async get(filter: IMarketFilter): Promise<IMarket | undefined> {
        // find market
        const [market] = await MarketFilter.find(filter);
        return market;
    }

    public async list(filter: IMarketFilter): Promise<IMarketList[]> {
        // create filters
        filter.is_admin = this.isAdminRequest;
        return MarketFilter.list(merge(filter, this.requestInfo));
    }

    public async add(data: IMarketPublic): Promise<IMarket> {
        // validate request
        if (!data) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        if (isNotNumber(data.category_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        if (!isString(data.name)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const requestInfo = cloneDeep(this.requestInfo);
        // find market
        const [findedMarket] = await this.list({ category_id: data.category_id, name: data.name });
        if (!isNil(findedMarket)) {
            // throw ErrorUtil.newError(ErrorCodes.MARKET_ALREADY_EXISTS);
            return (await this.get({ id: findedMarket.id, include_order: false, include_selections: false })) as IMarket;
        }
        // find category
        const category = await broker.sendRequest<ICategory>(CommunicationCodes.GET_CATEGORY, { id: data.category_id }, QueueType.CATEGORY_SERVICE);
        // set market code
        if (category && category.code) data.code = `${category.code}${data.trading_mode}`;
        // create market
        let market = new Market(data, this.source);
        market = await market.saveWithID();
        // create market settings
        const settings: IMarketSettings[] = [];
        if (market.trading_mode === TradingMode.BOTH) {
            settings.push({ market_id: <number>market.id, category_id: <number>market.category_id, trading_mode: TradingMode.PREMATCH });
            settings.push({ market_id: <number>market.id, category_id: <number>market.category_id, trading_mode: TradingMode.LIVE });
        } else {
            settings.push({ market_id: <number>market.id, category_id: <number>market.category_id, trading_mode: <number>market.trading_mode });
        }
        await this.marketSettingsService.updateMany(<number>market.id, settings);
        const marketTranslations = await this.marketNameService.updateMany(
            <IMarketTranslation[]>[{ name: data.name }],
            <number>market.id,
            requestInfo.website_id,
            requestInfo.lang_id,
            false
        );
        const marketOrders = await this.marketOrderService.updateMany(<IMarketOrder[]>[{ order_id: 0 }], <number>market.id, requestInfo.website_id, false);

        if (market.status_id === GeneralStatus.ACTIVE) this.sendToCache(market, CommunicationCodes.ADD_MARKET, marketOrders, marketTranslations);
        return market;
    }

    public async clone(id: number): Promise<IMarket> {
        // check if ID exist
        if (!id) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        // find existing market by id
        const findedMarket = await Market.findOne({ id });
        // validate finded market
        if (isUndefined(findedMarket)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // save market
        const marketClone = new Market(findedMarket);
        marketClone.sourceData = this.source;
        await marketClone.saveWithID();
        // copy market selections
        const marketSelections = await Selection.findMany({ market_id: id });
        await map(
            marketSelections,
            async selection => {
                const selectionClone = await this.selectionService.clone(<number>selection.id);
                selectionClone.market_id = <number>marketClone.id;
                selectionClone.sourceData = this.source;
                return selectionClone.update();
            },
            { concurrency: 1 }
        );
        // copy market orders
        const marketOrders = await MarketOrder.findMany({ market_id: id });
        await map(marketOrders, async order => {
            order.market_id = <number>marketClone.id;
            order.sourceData = this.source;
            return new MarketOrder(order).saveWithID();
        });
        // copy market translations
        const marketTranslations = await MarketTranslation.findMany({ market_id: id });
        await map(marketTranslations, async translation => {
            translation.market_id = <number>marketClone.id;
            translation.sourceData = this.source;
            return new MarketTranslation(translation).saveWithID();
        });
        // copy market dynamic limits
        const marketDynamics = await MarketDynamicLimit.findMany({ market_id: id });
        await map(marketDynamics, async dynamic => {
            dynamic.market_id = <number>marketClone.id;
            return new MarketDynamicLimit(dynamic).saveWithID();
        });
        return marketClone;
    }

    public async update(data: IMarket): Promise<IMarket> {
        if (!isNotNumber(data.status_id) && !(toNumber(data.status_id) in GeneralStatus)) throw ErrorUtil.newError(ErrorCodes.INVALID_STATUS);
        const market = await this.get({ id: data.id });
        // if market not found return error
        if (!market) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        const marketBeforeUpdate = cloneDeep(market);
        // update market
        market.sourceData = this.source;
        // update market code
        if (market.code) data.code = `${market.code.substr(0, 2)}${data.trading_mode}`;
        // check event with this market
        if (data.status_id == GeneralStatus.ARCHIVED) {
            const exists = await broker.sendRequest<boolean>(
                CommunicationCodes.CHECK_EVENT_WITH_MARKET_OR_SELECTION,
                {
                    market_id: market.id
                },
                QueueType.EVENT_SERVICE
            );
            if (exists) throw ErrorUtil.newError(ErrorCodes.MARKET_BLOCKED_BY_EVENT);
        }
        // update market
        const updated = await market.update(new Market(data));

        let eventMarketUpdatedData = <IEventMarket>{};
        if (data.status_id !== marketBeforeUpdate.status_id) eventMarketUpdatedData.status_id = data.status_id;
        if (!isUndefined(data.void_on_event_cancel) && data.void_on_event_cancel !== marketBeforeUpdate.void_on_event_cancel) {
            eventMarketUpdatedData.void_on_event_cancel = data.void_on_event_cancel;
        }
        if (!isUndefined(data.sport_default) && toBoolean(data.sport_default) !== toBoolean(marketBeforeUpdate.sport_default)) {
            eventMarketUpdatedData.sport_default = data.sport_default;
        }
        if (Object.keys(eventMarketUpdatedData).length > 0) {
            broker.publishMessageWithCode(
                CommunicationCodes.UPDATE_EVENT_MARKETS_FROM_MARKETS,
                {
                    filterData: {
                        market_id: market.id,
                        include_selections: false,
                        withRestrictionEventMarketDetails: false
                    },
                    updatedData: eventMarketUpdatedData
                },
                QueueType.EVENT_SERVICE,
                this.source
            );
        }

        this.checkToUpdateCache(updated, marketBeforeUpdate);
        return updated;
    }

    /**
     * Update market code when category code changes
     *
     * @param {number} code
     * @returns {Promise<IMarketPublic>}
     * @memberOf {MarketService}
     */
    public async updateCode(category: ICategory): Promise<void> {
        const markets = await MarketFilter.listBase({ category_id: category.id });
        await each(markets, market => new Market(market, this.source).update({ code: `${category.code}${market.id}${market.trading_mode}` }));
    }

    public async delete(data: IMarket, forceDelete: boolean = false): Promise<IDeleteResponse> {
        if (!data || !data.id || isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market
        const market = await this.get({ id: data.id });
        if (!market || !market.id) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        const res = <IDeleteResponse>{};
        if (!forceDelete) {
            if (await this.checkBetSLips(data)) {
                res.canceled = false;
                res.reason = "market have active bets";
                return res;
            }
        }
        //delete event markets
        await broker.sendRequest(
            CommunicationCodes.DELETE_EVENT_MARKET_BY_MARKET_ID_CASCADE,
            {
                market_id: market.id
            },
            QueueType.EVENT_SERVICE,
            ``,
            this.source
        );

        // delete selections
        await this.selectionService.deleteMarketSelections(market.id, false);

        // delete market extensions
        // await this.marketCMSService.delete(market.id);
        // await this.marketDynamicLimitService.delete(market.id);
        // await this.marketNameService.delete(market.id);
        // await this.marketOrderService.delete(market.id);
        // await this.marketSettingsService.delete(market.id);
        const marketBeforeUpdate = cloneDeep(market);
        // delete market
        market.sourceData = this.source;
        const updated = await market.update({ status_id: GeneralStatus.ARCHIVED });
        this.checkToUpdateCache(updated, marketBeforeUpdate);
        res.canceled = true;
        return res;
    }

    private async checkBetSLips(data: IMarket): Promise<boolean> {
        if (!data || !data.id || isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market
        const market = await this.get({ id: data.id });
        if (!market || !market.id) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        return broker.sendRequest<boolean>(
            CommunicationCodes.CHECK_ACTIVE_BET_BY_FILTER,
            {
                market_id: market.id,
                unlimit: false,
                limit: 1,
                status_id: BetSlipStatus.OPEN
            },
            QueueType.BETSLIP_SERVICE
        );
    }

    public async getMarketRestrictions(id: number): Promise<number[]> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market = await this.get({
            id,
            include_selections: false
        });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        return market.restricted_markets.map(item => toNumber(item));
    }

    public async addMarketRestrictions(id: number, restricted_id: number): Promise<number[]> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        if (isNotNumber(restricted_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const restrictedMarket = await this.get({
            id: restricted_id,
            include_selections: false
        });
        let market = await this.get({
            id,
            include_selections: false
        });
        if (isUndefined(market) || isUndefined(restrictedMarket)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        market = await market.addToArray(<number>market.id, "bigint", "restricted_markets", "id", <number>restrictedMarket.id, true, "*");
        await BaseModel.addToArray(Market, <number>restrictedMarket.id, "bigint", "restricted_markets", "id", <number>market.id, Market.tableName, true, "*");

        BaseModelWithLogger.SendLog(
            Market.tableName,
            {
                model_id: id,
                object_before: market,
                object_after: Object.assign({}, market, {
                    restricted_markets: concat(market.restricted_markets, [restricted_id])
                })
            },
            HistoryActionType.UPDATE,
            this.source
        );

        BaseModelWithLogger.SendLog(
            Market.tableName,
            {
                model_id: restricted_id,
                object_before: restrictedMarket,
                object_after: Object.assign({}, restrictedMarket, {
                    restricted_markets: concat(restrictedMarket.restricted_markets, [id])
                })
            },
            HistoryActionType.UPDATE,
            this.source
        );

        return market.restricted_markets.map(item => toNumber(item));
    }

    public async updateMarketRestrictions(id: number, restricted_ids: number[]): Promise<number[]> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        let market = await this.get({
            id,
            include_selections: false
        });
        // if market not found return
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        // delete restrictions
        await this.deleteMarketRestrictions(id);
        return map(restricted_ids, async (restrictedMarket: number) => {
            await this.addMarketRestrictions(restrictedMarket, id);
            // await BaseModel.addToArray(Market, restrictedMarket, 'bigint', 'restricted_markets', 'id', id, Market.tableName, true, '*');
            return restrictedMarket;
        });
    }

    public async deleteMarketRestriction(id: number, restricted_id: number): Promise<void> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const restrictedMarket = await this.get({
            id: restricted_id,
            include_selections: false
        });
        let market = await this.get({
            id,
            include_selections: false
        });
        if (isUndefined(market) || isUndefined(restrictedMarket)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        await market.removeFromArray(<number>market.id, "bigint", "restricted_markets", "id", <number>restrictedMarket.id);
        await restrictedMarket.removeFromArray(<number>restrictedMarket.id, "bigint", "restricted_markets", "id", <number>market.id);

        BaseModelWithLogger.SendLog(
            Market.tableName,
            {
                model_id: id,
                object_before: market,
                object_after: Object.assign({}, market, {
                    restricted_markets: difference(market.restricted_markets, [restricted_id])
                })
            },
            HistoryActionType.UPDATE,
            this.source
        );

        BaseModelWithLogger.SendLog(
            Market.tableName,
            {
                model_id: restricted_id,
                object_before: restrictedMarket,
                object_after: Object.assign({}, restrictedMarket, {
                    restricted_markets: difference(restrictedMarket.restricted_markets, [id])
                })
            },
            HistoryActionType.UPDATE,
            this.source
        );
    }

    public async deleteMarketRestrictions(id: number): Promise<void> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        let market = await this.get({
            id,
            include_selections: false
        });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);

        await each(market.restricted_markets, async (restrictedMarket: number) => {
            if (!market) return;
            await market.removeFromArray(<number>market.id, "bigint", "restricted_markets", "id", restrictedMarket);
            await market.removeFromArray(restrictedMarket, "bigint", "restricted_markets", "id", <number>market.id);
        });

        BaseModelWithLogger.SendLog(
            Market.tableName,
            {
                model_id: id,
                object_before: market,
                object_after: Object.assign({}, market, {
                    restricted_markets: []
                })
            },
            HistoryActionType.UPDATE,
            this.source
        );
    }

    private checkToUpdateCache(objectAfterUpdate: IMarket, objectBeforeUpdate: IMarket): void {
        if (objectBeforeUpdate.status_id !== objectAfterUpdate.status_id) {
            if (objectAfterUpdate.status_id === GeneralStatus.ACTIVE) {
                this.sendToCache(objectAfterUpdate, CommunicationCodes.ADD_MARKET);
            } else this.sendToCache(objectAfterUpdate, CommunicationCodes.DELETE_MARKET);
        } else if (
            objectAfterUpdate.trading_mode !== objectBeforeUpdate.trading_mode ||
            !isEqual(objectAfterUpdate.display_type, objectBeforeUpdate.display_type) ||
            toBoolean(objectAfterUpdate.sport_default) !== toBoolean(objectBeforeUpdate.sport_default)
        ) {
            this.sendToCache(objectAfterUpdate);
        }
    }

    private async sendToCache(
        market: IMarket,
        code: CommunicationCodes = CommunicationCodes.UPDATE_MARKET,
        marketOrders?: IMarketOrder[],
        marketTranslations?: IMarketTranslation[],
        selections?: ISelectionList[],
        selectionsOrders: ISelectionOrder[] = [],
        selectionsTranslations: ISelectionTranslation[] = []
    ): Promise<void> {
        if (code === CommunicationCodes.ADD_MARKET) {
            if(isUndefined(marketOrders)) {
                marketOrders = await MarketOrderFilter.getAll(market.id);
            }
            if(isUndefined(marketTranslations)) {
                marketTranslations = await MarketNameFilter.getAll(market.id);
            }
            if(isUndefined(selections)) {
                selections = await SelectionFilter.list({
                    market_id: market.id,
                    include_name: true,
                    include_order: true
                });
                if(selections.length) {
                    const selectionIds = selections.map(selection => selection.id);
                    selectionsOrders = await SelectionOrderFilter.getAll({selection_ids: selectionIds});
                    selectionsTranslations = await SelectionNameFilter.getAll({selection_ids: selectionIds});
                }
            }
            broker.publishMessageWithCode(
                code,
                {
                    market,
                    marketOrders,
                    marketTranslations,
                    selections,
                    selectionsOrders,
                    selectionsTranslations
                },
                QueueType.CACHE_SERVICE
            );
        }
        else broker.publishMessageWithCode(code, market, QueueType.CACHE_SERVICE);
    }
}
