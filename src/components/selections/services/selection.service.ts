import { ISelectionPublic, ISelectionFilter, ISelectionList, ISelection } from "../interfaces/selection.interface";
import { SelectionFilter } from "../filters/selection.filter";
import { broker } from "../../../../../CommonJS/src/base/base.model";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { Selection } from "../models/selection.model";
import { MarketFilter } from "../../markets/filters/market_admin.filter";
import { isUndefined } from "util";
import { isNotNumber, isRealString } from "../../../../../CommonJS/src/utils/validators";
import { SelectionNameService } from "../../selection_name/services/selection_name.service";
import { SelectionOrderService } from "../../selection_order/services/selection_order.service";
import { SelectionSettingsService } from "../../selection_settings/services/selection_settings.service";
import { IMessage } from "../../../../../CommonJS/src/messaging/message.interface";
import { each, map } from "bluebird";
import { cloneDeep, toNumber } from "lodash";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { ISelectionSettings } from "../../selection_settings/interfaces/selection_settings.interface";
import { ISelectionTranslation } from "../../selection_name/interfaces/selection_name.interface";
import { ISelectionOrder } from "../../selection_order/interfaces/selection_order.interface";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";
import { BetSlipStatus } from "../../../../../BetSlipService/src/components/betslip/enums/betslip_status.enum";
import { IDeleteResponse } from "../../../../../CommonJS/src/interfaces/cancel.interface";
import { SelectionOrder } from "../../selection_order/models/selection_order.model";
import { SelectionTranslation } from "../../selection_name/models/selection_name.model";
import { SelectionOrderFilter } from "../../selection_order/filters/selection_order.filter";
import { SelectionNameFilter } from "../../selection_name/filters/selection_name.filter";

export class SelectionService extends ServiceWithRequestInfo {
    private selectionNamesService = new SelectionNameService();
    private selectionOrderService = new SelectionOrderService();
    private selectionSettingsService = new SelectionSettingsService();

    public setRequestInfo(data: IMessage): void {
        super.setRequestInfo(data);
        this.selectionNamesService.setRequestInfo(data);
        this.selectionOrderService.setRequestInfo(data);
        this.selectionSettingsService.setRequestInfo(data);
    }

    public async clone(id: number): Promise<ISelection> {
        if (!id) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const selection = await Selection.findOne({ id });
        if (isUndefined(selection)) throw ErrorUtil.newError(ErrorCodes.MARKET_SETTING_DOES_NOT_EXISTS);
        const selectionClone = await new Selection(selection);
        selectionClone.sourceData = this.source;
        await selectionClone.saveWithID();

        // orders
        const selectionOrders = await SelectionOrder.findMany({ selection_id: id });
        await map(selectionOrders, async order => {
            order.selection_id = <number>selectionClone.id;
            order.sourceData = this.source;
            return new SelectionOrder(order).saveWithID();
        });

        // translations
        const selectionTranslations = await SelectionTranslation.findMany({ selection_id: id });
        await map(selectionTranslations, async translation => {
            translation.selection_id = <number>selectionClone.id;
            translation.sourceData = this.source;
            return new SelectionTranslation(translation).saveWithID();
        });

        return selectionClone;
    }

    public async get(filter: Partial<ISelectionFilter>): Promise<ISelectionPublic | undefined> {
        if (isNotNumber(filter.id)) {
            if (isNotNumber(filter.market_id) && !isRealString(filter.name, 1)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        }
        // find selection
        const [selection] = await SelectionFilter.find(Object.assign(filter, this.requestInfo));
        return selection;
    }

    public async list(filter: Partial<SelectionFilter>): Promise<ISelectionList[]> {
        // find selections
        return SelectionFilter.list(Object.assign(filter, this.requestInfo));
    }

    public async add(market_id: number, data: ISelectionPublic): Promise<ISelection> {
        if (isNotNumber(market_id)) throw ErrorUtil.newError(ErrorCodes.MARKET_ID_IS_MISSING);
        const requestInfo = cloneDeep(this.requestInfo);
        data.market_id = market_id;
        // check market from market_id
        const [market] = await MarketFilter.find({ id: market_id });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_DOES_NOT_EXISTS);
        // find selection if it is already exists
        if (isUndefined(data)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const oldSelection = await this.get({ market_id, name: data.name });
        if (oldSelection) {
            oldSelection.status_id = GeneralStatus.ACTIVE;
            await Selection.update(new Selection(oldSelection));
            return oldSelection;
        }
        // save selection
        data.trading_mode = <number>market.trading_mode;
        let selection = new Selection(data, this.source);
        selection = await selection.saveWithID();
        // create market settings
        const settings: ISelectionSettings[] = [];
        if (selection.trading_mode === TradingMode.BOTH) {
            settings.push({ selection_id: <number>selection.id, trading_mode: TradingMode.PREMATCH });
            settings.push({ selection_id: <number>selection.id, trading_mode: TradingMode.LIVE });
        } else {
            settings.push({ selection_id: <number>selection.id, trading_mode: <number>selection.trading_mode });
        }
        await this.selectionSettingsService.updateMany(<number>selection.id, settings);
        await this.selectionNamesService.updateMany(<number>selection.id, <ISelectionTranslation[]>[{ name: data.name }], requestInfo.website_id, requestInfo.lang_id, false);
        await this.selectionOrderService.updateMany(<number>selection.id, <ISelectionOrder[]>[{ row_index: 0, column_index: 1 }], requestInfo.website_id, false);
        this.sendToCache(selection, CommunicationCodes.ADD_MARKET_SELECTION);
        return selection;
    }

    public async update(id: number, data: ISelectionPublic): Promise<ISelection> {
        let [selection] = await SelectionFilter.listBase({ id });
        // if selection not found return error
        if (isUndefined(selection)) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        const selectionBeforeUpdate = cloneDeep(selection);
        // update selection
        selection.sourceData = this.source;
        const updated = await selection.update(new Selection(data));

        if (!isUndefined(data.status_id) && data.status_id !== selectionBeforeUpdate.status_id) {
            broker.publishMessageWithCode(
                CommunicationCodes.UPDATE_EVENT_SELECTIONS_FROM_SELECTION,
                {
                    selection_id: selection.id,
                    updatedData: {
                        status_id: data.status_id
                    }
                },
                QueueType.EVENT_SERVICE,
                this.source
            );
        }

        // await this.checkUserBasedLimits(selectionBeforeUpdate, updated);
        this.checkToUpdateCache(updated, selectionBeforeUpdate);
        return Object.assign(selection, updated);
    }

    public async deleteMarketSelections(market_id: number, deleteEventSelection?: boolean): Promise<void> {
        const selections = await this.list({ market_id });
        await each(selections, selection => this.delete(selection.id, deleteEventSelection, true));
    }

    public async delete(id: number, deleteEventSelection: boolean = true, forceDelete: boolean = false): Promise<IDeleteResponse> {
        if (isNotNumber(id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // delete rules
        // await broker.sendRequest(CommunicationCodes.DELETE_RULE, { id }, QueueType.RESULT_SERVICE);
        // delete mapping
        // await broker.sendRequest(CommunicationCodes.UN_MAP_SYSTEM_SELECTION, { id }, QueueType.RESULT_SERVICE);

        let [selection] = await SelectionFilter.listBase({ id });
        if (!selection) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        const res = <IDeleteResponse>{};
        if (!forceDelete) {
            if (await this.checkBetSLips(selection)) {
                res.canceled = false;
                res.reason = "selection have active bets";
                return res;
            }
        }

        // check event with this selection
        const exists = await broker.sendRequest(
            CommunicationCodes.CHECK_EVENT_WITH_MARKET_OR_SELECTION,
            {
                selection_id: toNumber(id)
            },
            QueueType.EVENT_SERVICE
        );
        if (exists) throw ErrorUtil.newError(ErrorCodes.SELECTION_BLOCKED_BY_EVENT);
        // await this.selectionNamesService.delete(selection.id);
        // await this.selectionOrderService.delete(selection.id);
        // await this.selectionSettingsService.delete(selection.id);
        // await this.selectionDynamicLimitService.delete(selection.id);
        // delete selection
        const beforeUpdate = cloneDeep(selection);
        selection.sourceData = this.source;
        const updated = await selection.update({ status_id: GeneralStatus.ARCHIVED });

        if (deleteEventSelection) {
            await broker.sendRequest(
                CommunicationCodes.DELETE_EVENT_SELECTION_BY_SELECTION_ID_CASCADE,
                {
                    selection_id: id
                },
                QueueType.EVENT_SERVICE
            );
        }
        this.checkToUpdateCache(updated, beforeUpdate);
        res.canceled = true;
        return res;
    }

    public async checkBetSLips(data: ISelection): Promise<boolean> {
        if (!data || !data.id || isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find selection
        const selection = await this.get({ id: data.id });
        if (!selection || !selection.id) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        return broker.sendRequest<boolean>(
            CommunicationCodes.CHECK_ACTIVE_BET_BY_FILTER,
            {
                selection_id: selection.id,
                unlimit: false,
                limit: 1,
                status_id: BetSlipStatus.OPEN
            },
            QueueType.BETSLIP_SERVICE
        );
    }

    private checkToUpdateCache(objectAfterUpdate: ISelection, objectBeforeUpdate: ISelection): void {
        if (objectBeforeUpdate.status_id !== objectAfterUpdate.status_id) {
            if (objectAfterUpdate.status_id === GeneralStatus.ARCHIVED) this.sendToCache(objectAfterUpdate, CommunicationCodes.DELETE_MARKET_SELECTION);
            if (objectAfterUpdate.status_id === GeneralStatus.ACTIVE) this.sendToCache(objectAfterUpdate, CommunicationCodes.ADD_MARKET_SELECTION);
        }
    }

    private async sendToCache(selection: ISelection, code: CommunicationCodes = CommunicationCodes.UPDATE_MARKET_SELECTION): Promise<void> {
        if (code === CommunicationCodes.ADD_MARKET_SELECTION) {
            const orders = await SelectionOrderFilter.getAll({selection_id: selection.id});
            const translations = await SelectionNameFilter.getAll({selection_id: selection.id});

            broker.publishMessageWithCode(
                code,
                {
                    selection,
                    orders,
                    translations
                },
                QueueType.CACHE_SERVICE
            );
        }
        else broker.publishMessageWithCode(code, selection, QueueType.CACHE_SERVICE);
    }

    public async getRules(data: ISelectionFilter): Promise<ISelection[]> {
        return SelectionFilter.listRules(data);
    }
    public async updateRule(data: ISelectionPublic[]): Promise<void> {
        await map(data, async data => {
            if (isUndefined(data) || isUndefined(data.id) || isUndefined(data.rule)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
            return this.update(data.id, data);
        });
    }
}
