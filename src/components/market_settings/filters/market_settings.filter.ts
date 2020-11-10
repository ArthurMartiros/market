import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { MarketSettings } from "../models/market_settings.model";
import { IMarketSettings } from "../interfaces/market_settings.interface";

export class MarketSettingsFilter extends MarketSettings {
    public static findAll(data: IMarketSettings): Promise<IMarketSettings[]> {
        const filter = new MarketSettingsFilter(data);
        const query = QueryBuilder(MarketSettings.tableName)
            .where(`${MarketSettings.tableName}.market_id`, filter.market_id);
        return this.manyOrNone(query);
    }
    
    public static findWithTradingMode(data: IMarketSettings): Promise<IMarketSettings | undefined> {
        const filter = new MarketSettingsFilter(data);
        const query = QueryBuilder(MarketSettings.tableName)
            .where(`${MarketSettings.tableName}.market_id`, filter.market_id)
            .where(`${MarketSettings.tableName}.trading_mode`, filter.trading_mode);
        return this.oneOrNone(query);
    }
}