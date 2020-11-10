import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { MarketOrder } from "../models/market_order.model";
import { IMarketOrder } from "../interfaces/market_order.interfaces";
import { isUndefined } from "util";

export class MarketOrderFilter extends MarketOrder {
    public static findAll(data: IMarketOrder): Promise<IMarketOrder[]> {
        const filter = new MarketOrderFilter(data);
        const query = QueryBuilder(MarketOrder.tableName)
            .where(`${MarketOrder.tableName}.website_id`, filter.website_id)
            .where(`${MarketOrder.tableName}.market_id`, filter.market_id);
        return MarketOrder.manyOrNone(query);
    }

    //get all markets orders
    public static async getAll(market_id?: number): Promise<IMarketOrder[]> {
        const query = QueryBuilder(MarketOrder.tableName);
        if(!isUndefined(market_id)) {
            query.where(`market_id`, market_id);
        }
        return MarketOrder.manyOrNone(query);
    }
}