import { SourceType } from "../../../../../CommonJS/src/enums/source_type.enum";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { Market } from "../models/market.model";
import { QueryBuilder, RawParam } from "../../../../../CommonJS/src/base/base.model";
import { IMarket, IMarketFilter, IMarketList, IMarketPublic } from "../interfaces/market.interface";
import { DEFAULT_WEB_SITE, DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { MarketList } from "../models/market_list.model";
import { MarketPublic } from "../models/market_public.model";
import { isUndefined } from "util";
import { map } from "bluebird";
import { inEnum, isNotNumber, isNummericArray, isRealString, toBoolean } from "../../../../../CommonJS/src/utils/validators";
import { uniq } from "lodash";
import { SelectionFilter } from "../../selections/filters/selection.filter";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { MarketSettings } from "../../market_settings/models/market_settings.model";
import { MarketTranslation } from "../../market_name/models/market_name.model";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";
import { Scope } from "../../../../../EventService/src/components/scope/models/scope.model";

export class MarketFilter implements IMarketFilter {
    public id?: number;
    public category_id?: number;
    public ids?: number[];
    public name?: string;
    public alternative_name_1?: string;
    public alternative_name_2?: string;
    public selection_name?: string;
    public alt_selection_name?: string;
    public trading_mode?: TradingMode;
    public groups?: number[];
    public scope?: number;
    public restrictions_groups?: number[];
    public resolution_rules?: SourceType;
    public combination_min?: number;
    public combination_max?: number;
    public time_from?: number;
    public time_to?: number;
    public period_minute_from?: number;
    public period_minute_to?: number;
    public prematch_overask?: boolean;
    public live_overask?: boolean;
    public status_id?: GeneralStatus;
    public lang_id: number;
    public website_id: number;
    public channel_id: ChannelType;
    public period_name?: string;

    public limit = 10;
    public unlimit: boolean = true;
    public include_order?: boolean;

    constructor(data: IMarketFilter) {
        if (!isUndefined(data.category_id) && isNotNumber(data.category_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.category_id = data.category_id;
        if (!isUndefined(data.id) && isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.id = data.id;
        if (!isUndefined(data.ids) && !isNummericArray(data.ids)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.ids = data.ids;

        if (!isUndefined(data.trading_mode) && !inEnum(data.trading_mode, TradingMode)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.trading_mode = data.trading_mode;
        if (!isUndefined(data.groups) && !isNummericArray(data.groups)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.groups = data.groups || [];

        this.selection_name = data.selection_name;
        this.alt_selection_name = data.alt_selection_name;

        this.name = data.name;
        if (isRealString(this.name, 1)) this.name = this.name.toLowerCase();
        this.alternative_name_1 = data.alternative_name_1;
        if (isRealString(this.alternative_name_1, 1)) this.alternative_name_1 = this.alternative_name_1.toLowerCase();
        this.alternative_name_2 = data.alternative_name_2;
        if (isRealString(this.alternative_name_2, 1)) this.alternative_name_2 = this.alternative_name_2.toLowerCase();
        if (!isUndefined(data.scope) && isNotNumber(data.scope)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.scope = data.scope;
        if (!isUndefined(data.restrictions_groups) && !isNummericArray(data.restrictions_groups)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.restrictions_groups = data.restrictions_groups || [];
        if (!isUndefined(data.resolution_rules) && !inEnum(data.resolution_rules, SourceType)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.resolution_rules = data.resolution_rules;
        if (!isUndefined(data.combination_min) && isNotNumber(data.combination_min)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.combination_min = data.combination_min;
        if (!isUndefined(data.combination_max) && isNotNumber(data.combination_max)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.combination_max = data.combination_max;

        if (!isUndefined(data.time_from) && isNotNumber(data.time_from)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.time_from = data.time_from;
        if (!isUndefined(data.period_minute_from) && isNotNumber(data.period_minute_from)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.period_minute_from = data.period_minute_from;

        if (!isUndefined(data.time_to) && isNotNumber(data.time_to)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.time_to = data.time_to;
        if (!isUndefined(data.period_minute_to) && isNotNumber(data.period_minute_to)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.period_minute_to = data.period_minute_to;

        this.live_overask = data.live_overask;
        this.prematch_overask = data.prematch_overask;
        if (!isUndefined(data.status_id) && !inEnum(data.status_id, GeneralStatus)) throw ErrorUtil.newError(ErrorCodes.INVALID_STATUS);
        this.status_id = data.status_id;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
        this.unlimit = toBoolean(data.unlimit, true);
        this.include_order = toBoolean(data.include_order, true);
        this.period_name = data.period_name;
    }

    public static async list(data: IMarketFilter): Promise<IMarketList[]> {
        const filter = new MarketFilter(data);

        if (isRealString(filter.selection_name, 1)) {
            const selectionsByFilter = await SelectionFilter.list({
                website_id: filter.website_id,
                channel_id: filter.channel_id,
                lang_id: filter.lang_id,
                name: filter.selection_name
            });
            if (selectionsByFilter.length === 0) return [];
            filter.ids = await map(selectionsByFilter, selection => selection.market_id);
            filter.ids = uniq(filter.ids);
        }

        if (isRealString(filter.alt_selection_name, 1)) {
            const selectionsByFilter = await SelectionFilter.list({
                website_id: filter.website_id,
                channel_id: filter.channel_id,
                lang_id: filter.lang_id,
                alt_name: filter.alt_selection_name
            });
            if (selectionsByFilter.length === 0) return [];
            if (!isUndefined(filter.ids) && filter.ids.length > 0) {
                const tmp = await map(selectionsByFilter, selection => selection.market_id);
                filter.ids = filter.ids.concat(uniq(tmp));
            } else {
                filter.ids = await map(selectionsByFilter, selection => selection.market_id);
            }
            filter.ids = uniq(filter.ids);
        }

        const query = QueryBuilder(Market.tableName).orderBy("id", "DESC");
        // join names
        query.join(`${MarketTranslation.tableName} as def_name_tr`, function() {
            this.on(`def_name_tr.market_id`, `${Market.tableName}.id`);
            this.andOn(`def_name_tr.website_id`, RawParam(DEFAULT_WEB_SITE));
            this.andOn(`def_name_tr.channel_id`, RawParam(ChannelType.BACKEND));
            this.andOn(`def_name_tr.lang_id`, RawParam(DEFAULT_LANGUAGE));
        });
        query.leftJoin(`${MarketTranslation.tableName} as name_tr`, function() {
            this.on(`name_tr.market_id`, `${Market.tableName}.id`);
            this.andOn(`name_tr.website_id`, RawParam(filter.website_id));
            this.andOn(`name_tr.channel_id`, RawParam(filter.channel_id));
            this.andOn(`name_tr.lang_id`, RawParam(filter.lang_id));
        });
        if (filter.period_name) {
            query.leftJoin(`${Scope.tableName}`, `${Scope.tableName}.id`, `${Market.tableName}.scope_id`);
        }
        // orders
        if (filter.include_order) {
            query
                .joinRaw(
                    `left join market_order as df_market_order on df_market_order.market_id = market.id and df_market_order.channel_id = ? and df_market_order.website_id = ?`,
                    [ChannelType.BACKEND, DEFAULT_WEB_SITE]
                )
                .joinRaw(`left join market_order on market_order.market_id = market.id and market_order.channel_id = ? and market_order.website_id = ?`, [
                    filter.channel_id,
                    DEFAULT_WEB_SITE
                ])
                .select(QueryBuilder.raw(`coalesce(market_order.order_id, df_market_order.order_id, 999) as order_id`))
                .orderBy(`order_id`);
        }

        if (!filter.unlimit) {
            query.limit(filter.limit);
        }
        query
            .select(`${Market.tableName}.id`)
            .select(`${Market.tableName}.status_id`)
            .select(`${Market.tableName}.category_id`)
            .select(`${Market.tableName}.trading_mode`)
            .select(`${Market.tableName}.sport_default`)
            .select(QueryBuilder.raw(`coalesce(CASE WHEN name_tr.name = '' then null else name_tr.name end, def_name_tr.name) as name`));

        if (isRealString(filter.alternative_name_1)) {
            query.select(QueryBuilder.raw(`coalesce(name_tr.alt_name_1, def_name_tr.alt_name_1) as alt_name_1`));
        }
        if (isRealString(filter.alternative_name_2)) {
            query.select(QueryBuilder.raw(`coalesce(name_tr.alt_name_2, def_name_tr.alt_name_2) as alt_name_2`));
        }
        if (isRealString(filter.period_name, 2)) {
            query.where(`${Scope.tableName}.name`, "ilike", `%${filter.period_name}%`);
        }
        if (filter.category_id) query.where(`${Market.tableName}.category_id`, filter.category_id);
        if (filter.id) query.where(`${Market.tableName}.id`, filter.id);
        if (filter.ids) query.whereIn(`${Market.tableName}.id`, filter.ids);
        if (filter.trading_mode) query.where(`${Market.tableName}.trading_mode`, filter.trading_mode);
        if (filter.groups && filter.groups.length) query.where(`${Market.tableName}.groups`, "@>", filter.groups);
        if (filter.scope) query.where(`${Market.tableName}.scope_id`, filter.scope);
        if (filter.restrictions_groups && filter.restrictions_groups.length)
            query.where(`${Market.tableName}.restriction_groups`, "@>", filter.restrictions_groups);
        if (filter.resolution_rules) query.where(`${Market.tableName}.result_source_id`, filter.resolution_rules);
        if (filter.combination_min) query.where(`${Market.tableName}.combination_min`, filter.combination_min);
        if (filter.combination_max) query.where(`${Market.tableName}.combination_max`, filter.combination_max);
        if (filter.period_minute_from) query.where(`${Market.tableName}.time_from`, filter.period_minute_from);
        if (filter.period_minute_to) query.where(`${Market.tableName}.time_to`, filter.period_minute_to);

        // join live settings
        if (!isUndefined(filter.live_overask)) {
            query
                .leftJoin(`${MarketSettings.tableName} as live_settings`, function() {
                    this.on(`live_settings.market_id`, `${Market.tableName}.id`);
                    this.andOn(`live_settings.trading_mode`, RawParam(TradingMode.LIVE));
                })
                .where(`live_settings.overask`, toBoolean(filter.live_overask));
        }
        // join prematch settings
        if (!isUndefined(filter.prematch_overask)) {
            query
                .leftJoin(`${MarketSettings.tableName} as prematch_settings`, function() {
                    this.on(`prematch_settings.market_id`, `${Market.tableName}.id`);
                    this.andOn(`prematch_settings.trading_mode`, RawParam(TradingMode.PREMATCH));
                })
                .where(`prematch_settings.overask`, toBoolean(filter.prematch_overask));
        }

        if (filter.status_id) query.where(`${Market.tableName}.status_id`, filter.status_id);
        let markets: IMarketList[] = [];

        if (isRealString(filter.alternative_name_1, 1)) {
            const marketsPublic = await MarketPublic.manyOrNone(query);
            markets = await map(
                marketsPublic.filter(mp => {
                    if (mp.alt_name_1) {
                        return mp.alt_name_1.toLowerCase().indexOf(<string>filter.alternative_name_1) >= 0;
                    } else return false;
                }),
                mp => {
                    return new MarketList(mp);
                }
            );
        }

        if (isRealString(filter.alternative_name_2, 1)) {
            const marketsPublic = await MarketPublic.manyOrNone(query);
            markets = await map(
                marketsPublic.filter(mp => {
                    if (mp.alt_name_2) {
                        return mp.alt_name_2.toLowerCase().indexOf(<string>filter.alternative_name_2) >= 0;
                    } else return false;
                }),
                mp => {
                    return new MarketList(mp);
                }
            );
        }
        if (isRealString(filter.name, 1)) {
            markets = await MarketList.manyOrNone(query);
            markets = markets.filter(m => (m.name ? m.name.toLowerCase().indexOf(<string>filter.name) >= 0 : false));
        }
        if (!isRealString(filter.name, 1) && !isRealString(filter.alternative_name_2, 1) && !isRealString(filter.alternative_name_1, 1)) {
            markets = await MarketList.manyOrNone(query);
        }
        return markets;
    }

    public static async find(data: IMarketFilter): Promise<IMarketPublic[]> {
        const filter = new MarketFilter(data);
        const query = QueryBuilder(Market.tableName)
            .limit(1)
            .orderBy("id", "DESC");
        if (filter.category_id) query.where(`${Market.tableName}.category_id`, filter.category_id);
        if (filter.id) query.where(`${Market.tableName}.id`, filter.id);
        if (filter.trading_mode) query.where(`${Market.tableName}.trading_mode`, filter.trading_mode);
        if (filter.groups && filter.groups.length) query.where(`${Market.tableName}.groups`, "@>", filter.groups);
        if (filter.scope) query.where(`${Market.tableName}.scope_id`, filter.scope);
        if (filter.restrictions_groups && filter.restrictions_groups.length)
            query.where(`${Market.tableName}.restriction_groups`, "@>", filter.restrictions_groups);
        if (filter.resolution_rules) query.where(`${Market.tableName}.result_source_id`, filter.resolution_rules);
        if (filter.combination_min) query.where(`${Market.tableName}.combination_min`, filter.combination_min);
        if (filter.combination_max) query.where(`${Market.tableName}.combination_max`, filter.combination_max);
        if (filter.time_from) query.where(`${Market.tableName}.time_from`, filter.time_from);
        if (filter.time_to) query.where(`${Market.tableName}.time_to`, filter.time_to);

        return MarketPublic.manyOrNone(query);
    }

    public static async listBase(data: IMarketFilter): Promise<IMarket[]> {
        const filter = new MarketFilter(data);
        const query = QueryBuilder(Market.tableName).orderBy("id", "DESC");
        if (filter.category_id) query.where(`category_id`, filter.category_id);
        if (filter.id) query.where(`id`, filter.id);
        if (filter.trading_mode) query.where(`trading_mode`, filter.trading_mode);
        if (filter.groups && filter.groups.length) query.where(`groups`, "@>", filter.groups);
        if (filter.scope) query.where(`scope_id`, filter.scope);
        if (filter.restrictions_groups && filter.restrictions_groups.length) query.where(`restriction_groups`, "@>", filter.restrictions_groups);
        if (filter.resolution_rules) query.where(`result_source_id`, filter.resolution_rules);
        if (filter.combination_min) query.where(`combination_min`, filter.combination_min);
        if (filter.combination_max) query.where(`combination_max`, filter.combination_max);
        if (filter.time_from) query.where(`time_from`, filter.time_from);
        if (filter.time_to) query.where(`time_to`, filter.time_to);

        return Market.manyOrNone(query);
    }
}
