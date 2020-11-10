import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { MarketCMSTranslation } from "../models/market_cms.model";
import { IMarketCMSTranslation } from '../interfaces/market_cms.interface';

export class MarketCMSFilter extends MarketCMSTranslation {
    public static findAll(data: IMarketCMSTranslation): Promise<IMarketCMSTranslation[]> {
        const filter = new this(data);
        const query = QueryBuilder(this.tableName)
            .where(`${this.tableName}.market_id`, filter.market_id)
            .where(`${this.tableName}.website_id`, filter.website_id)
            .where(`${this.tableName}.lang_id`, filter.lang_id);
        return this.manyOrNone(query);
    }
}