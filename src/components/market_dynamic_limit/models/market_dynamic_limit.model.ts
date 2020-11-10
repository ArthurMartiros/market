import { BaseModel, QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { merge } from "lodash";
import { IMarketDynamicLimit } from "../interfaces/market_dynamic_limit.interface";
import { each } from "bluebird";

export class MarketDynamicLimit extends BaseModel implements IMarketDynamicLimit {
    public static tableName = "market_dynamic_limit";
    public id?: number;
    public market_id: number;
    public minutes_before?: number;
    public limit?: number;
    public trading_mode?: TradingMode;

    constructor(data: IMarketDynamicLimit) {
        super();
        this.id = data.id;
        this.market_id = data.market_id;
        this.minutes_before = data.minutes_before;
        this.limit = data.limit;
        this.trading_mode = data.trading_mode;
    }

    public static async upsert(dynamicLimits: IMarketDynamicLimit[]): Promise<IMarketDynamicLimit[]> {
        if (!dynamicLimits || !dynamicLimits.length) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market_id = dynamicLimits[0].market_id;
        await each(dynamicLimits, async dynamicLimit => {
            const marketDynamicLimit = new MarketDynamicLimit(dynamicLimit);
            const savedLimit = await MarketDynamicLimit.findOne({ minutes_before: dynamicLimit.minutes_before, market_id });
            if (savedLimit) return marketDynamicLimit.update();
            else {
                const savedMarketDynamicLimit = await marketDynamicLimit.saveWithID();
                return merge(dynamicLimit, savedMarketDynamicLimit);
            }
        });
        // delete old limits
        await MarketDynamicLimit.none(QueryBuilder(MarketDynamicLimit.tableName)
            .where({ market_id: market_id })
            .whereNotIn('minutes_before', dynamicLimits.map(d => d.minutes_before || 0))
            .delete());
        // 
        return dynamicLimits;
    }
}