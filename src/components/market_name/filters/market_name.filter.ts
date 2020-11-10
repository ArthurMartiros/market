import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { IMarketTranslation, IMarketTranslationFilter } from "../interfaces/market_name.interface";
import { MarketTranslation } from "../models/market_name.model";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { isUndefined } from "util";
import { EventMarket } from "../../../../../EventService/src/components/event.market/models/event.market.model";

export class MarketNameFilter implements IMarketTranslationFilter {
    id?: number;
    market_id?: number;
    event_market_id?: number;
    lang_id?: number;
    name?: string;
    alt_name_1?: string;
    alt_name_2?: string;
    website_id?: number;
    channel_id?: ChannelType;
    constructor(data: IMarketTranslationFilter) {
        this.id = data.id;
        this.market_id = data.market_id;
        this.event_market_id = data.event_market_id;
        this.lang_id = data.lang_id;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
        this.alt_name_2 = data.alt_name_2;
        this.website_id = data.website_id;
        this.channel_id = data.channel_id;
    }
    public static async findAll(data: IMarketTranslationFilter): Promise<IMarketTranslation[]> {
        const filter = new MarketNameFilter(data);
        const query = QueryBuilder(MarketTranslation.tableName);
        if (filter.market_id) query.where(`${MarketTranslation.tableName}.market_id`, filter.market_id);
        if (filter.event_market_id) {
            query
                .join(`${EventMarket.tableName}`, `${MarketTranslation.tableName}.market_id`, `${EventMarket.tableName}.market_id`)
                .where(`${EventMarket.tableName}.id`, filter.event_market_id);
        }
        if (filter.website_id) query.where(`${MarketTranslation.tableName}.website_id`, filter.website_id);
        if (filter.lang_id) query.where(`${MarketTranslation.tableName}.lang_id`, filter.lang_id);
        return MarketTranslation.manyOrNone(query);
    }

    //get all markets translation
    //get all markets translations
    public static async getAll(market_id?: number): Promise<IMarketTranslation[]> {
        const query = QueryBuilder(MarketTranslation.tableName);
        if (!isUndefined(market_id)) query.where(`market_id`, market_id);
        return MarketTranslation.manyOrNone(query);
    }
}
