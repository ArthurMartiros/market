import { IMarketOrder } from "../interfaces/market_order.interfaces";
import { MarketOrder } from "../models/market_order.model";
import { MarketOrderFilter } from "../filters/market_order.filter";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { map } from "bluebird";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { MarketFilter } from "../../markets/filters/market_admin.filter";
import { isUndefined } from "util";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { cloneDeep, toNumber } from "lodash";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { broker } from "../../../../../CommonJS/src/base/base.model";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { DEFAULT_WEB_SITE } from "../../../../../CommonJS/src/domain/constant";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";

export class MarketOrderService extends ServiceWithRequestInfo {
    public async getForAllMarkets(): Promise<IMarketOrder[]> {
        return MarketOrderFilter.getAll();
    }

    public async getAll(data: IMarketOrder): Promise<IMarketOrder[]> {
        if (isNotNumber(data.market_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market = await MarketFilter.find({ id: data.market_id });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        return MarketOrderFilter.findAll(Object.assign({ market_id: data.market_id }, this.requestInfo));
    }

    public async updateMany(data: IMarketOrder[], market_id: number, website_id?: number, checkToUpdateCache: boolean = true) {
        return map(data, async channel => {
            channel.website_id = website_id || this.requestInfo.website_id;
            channel.market_id = market_id;
            if (!channel.order_id) {
                const order = await MarketOrder.one(`
                select coalesce(max(order_id) + 1, 1) as order_id 
                from market_order 
                join market m1 on m1.id = market_order.market_id
                join market m2 on m2.category_id = m1.category_id
                where m2.id = ${market_id}`);
                channel.order_id = order.order_id;
            }
            const byFields = {
                market_id: channel.market_id,
                channel_id: channel.channel_id,
                website_id: channel.website_id
            };

            const marketOrder = await MarketOrder.findOne(byFields);
            const beforeUpdate = cloneDeep(marketOrder);
            let res: IMarketOrder;

            if (marketOrder) {
                marketOrder.sourceData = this.source;
                res = await marketOrder.update(channel, byFields);
            } else res = await new MarketOrder(channel, this.source).saveWithID();

            if(checkToUpdateCache) this.checkToUpdateCache(res, beforeUpdate);

            return res;
        });
    }

    public async delete(market_id: number): Promise<void> {
        await map(MarketOrder.find({ market_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }

    private checkToUpdateCache(objectAfterUpdate: IMarketOrder, objectBeforeUpdate?: IMarketOrder): void {
        if (
            isUndefined(objectBeforeUpdate) &&
            toNumber(objectAfterUpdate.website_id) === DEFAULT_WEB_SITE &&
            toNumber(objectAfterUpdate.channel_id) === ChannelType.BACKEND
        )
            return;
        if (isUndefined(objectBeforeUpdate) || objectAfterUpdate.order_id !== objectBeforeUpdate.order_id) {
            this.sendToCache(objectAfterUpdate);
        }
    }

    private sendToCache(market: IMarketOrder): void {
        broker.publishMessageWithCode(CommunicationCodes.UPDATE_MARKET_ORDERS, market, QueueType.CACHE_SERVICE);
    }
}
