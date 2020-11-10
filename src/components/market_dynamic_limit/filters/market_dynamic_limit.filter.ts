import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { MarketDynamicLimit } from "../models/market_dynamic_limit.model";
import { IMarketDynamicLimit } from "../interfaces/market_dynamic_limit.interface";

export class MarketDynamicFilter extends MarketDynamicLimit {
    public static findAll(data: IMarketDynamicLimit): Promise<IMarketDynamicLimit[]> {
        const filter = new MarketDynamicFilter(data);
        const query = QueryBuilder(this.tableName)
            .where(`${this.tableName}.market_id`, filter.market_id)
            .orderByRaw(`id ASC`);
        if (filter.trading_mode) query.where(`${this.tableName}.market_id`, filter.trading_mode);
        return this.manyOrNone(query);
    }
}