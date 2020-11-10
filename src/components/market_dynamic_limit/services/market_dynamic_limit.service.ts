import { IMarketDynamicLimit } from "../interfaces/market_dynamic_limit.interface";
import { MarketDynamicFilter } from "../filters/market_dynamic_limit.filter";
import { MarketDynamicLimit } from "../models/market_dynamic_limit.model";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { BaseModelWithLogger } from "../../../../../CommonJS/src/base/baseWithLoger.model";
import { HistoryActionType } from "../../../../../HistoryService/src/common/enums/history_action_type.enum";
import { MarketFilter } from "../../markets/filters/market_admin.filter";
import { isUndefined } from "util";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { each } from "bluebird";

export class MarketDynamicLimitService extends ServiceWithRequestInfo {
    public async getAll(filter: IMarketDynamicLimit): Promise<IMarketDynamicLimit[]> {
        if (isNotNumber(filter.market_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market = await MarketFilter.find({ id: filter.market_id });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);

        return MarketDynamicFilter.findAll(filter);
    }

    public async updateMany(data: IMarketDynamicLimit[], market_id: number) {
        if (!data.length) {
            return this.delete(market_id);
        }
        const object_before = await this.getAll({ market_id });

        await each(data, marketName => marketName.market_id = market_id);

        const updated = await MarketDynamicLimit.upsert(data);

        BaseModelWithLogger.SendLog(MarketDynamicLimit.tableName, {
            model_id: market_id,
            object_before: object_before.length === 0 ? null : object_before,
            object_after: updated
        }, object_before.length === 0 ? HistoryActionType.CREATE : HistoryActionType.UPDATE, this.source);

        return updated;
    }

    public async delete(market_id: number): Promise<void> {
        const object_before = await this.getAll({ market_id });

        await MarketDynamicLimit.delete({ market_id });

        BaseModelWithLogger.SendLog(MarketDynamicLimit.tableName, {
            model_id: market_id,
            object_before,
            object_after: null
        }, HistoryActionType.DELETE, this.source);
    }
}