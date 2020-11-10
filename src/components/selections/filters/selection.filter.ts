import { ISelectionFilter, ISelectionPublic, ISelectionList, ISelection } from "../interfaces/selection.interface";
import { QueryBuilder, BaseModel, RawParam } from "../../../../../CommonJS/src/base/base.model";
import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from "../../../../../CommonJS/src/domain/constant";
import { Selection } from "../models/selection.model";
import { SelectionPublic } from "../models/selection_public.model";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { SelectionList } from "../models/selection_list.model";
import { SelectionOrder } from "../../selection_order/models/selection_order.model";
import { SelectionTranslation } from "../../selection_name/models/selection_name.model";
import { isUndefined } from "util";
import { isNotNumber, toBoolean, isRealString } from "../../../../../CommonJS/src/utils/validators";
import { uniq } from "lodash";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";
import { Market } from "../../markets/models/market.model";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { MarketTranslation } from "../../market_name/models/market_name.model";

export class SelectionFilter implements ISelectionFilter {
    public id?: number;
    public ids?: number[];
    public market_id?: number;
    public market_name?: string;
    public name?: string;
    public alt_name?: string;
    public website_id: number;
    public channel_id: ChannelType;
    public lang_id: number;
    public include_name?: boolean;
    public include_order?: boolean;

    constructor(data: ISelectionFilter) {
        this.id = data.id;
        this.ids = data.ids;
        if (!isUndefined(data.market_id) && isNotNumber(data.market_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        this.market_id = data.market_id;
        this.market_name = data.market_name;
        this.name = data.name;
        if (this.name) this.name = this.name.toLowerCase();
        this.alt_name = data.alt_name;
        if (this.alt_name) this.alt_name = this.alt_name.toLowerCase();
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.include_name = toBoolean(data.include_name, true);
        this.include_order = toBoolean(data.include_order, true);
    }

    public static async list(data: ISelectionFilter): Promise<ISelectionList[]> {
        const filter = new SelectionFilter(data);
        const query = QueryBuilder(Selection.tableName).where(`${Selection.tableName}.status_id`, GeneralStatus.ACTIVE);
        if (filter.include_name) {
            // join names
            query
                .leftJoin(`${SelectionTranslation.tableName} as def_name_tr`, function() {
                    this.on(`def_name_tr.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`def_name_tr.website_id`, RawParam(DEFAULT_WEB_SITE));
                    this.andOn(`def_name_tr.channel_id`, RawParam(ChannelType.BACKEND));
                    this.andOn(`def_name_tr.lang_id`, RawParam(DEFAULT_LANGUAGE));
                })
                .leftJoin(`${SelectionTranslation.tableName} as name_tr`, function() {
                    this.on(`name_tr.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`name_tr.website_id`, RawParam(filter.website_id));
                    this.andOn(`name_tr.channel_id`, RawParam(filter.channel_id));
                    this.andOn(`name_tr.lang_id`, RawParam(filter.lang_id));
                })
                .select(QueryBuilder.raw(`coalesce(name_tr.alt_name_1, def_name_tr.alt_name_1) as alt_name_1`))
                .select(QueryBuilder.raw(`coalesce(name_tr.name, def_name_tr.name) as name`));
        }
        if (filter.include_order) {
            // orders
            query
                .leftJoin(`${SelectionOrder.tableName} as def_order`, function() {
                    this.on(`def_order.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`def_order.website_id`, RawParam(DEFAULT_WEB_SITE));
                    this.andOn(`def_order.channel_id`, RawParam(ChannelType.BACKEND));
                })
                .leftJoin(`${SelectionOrder.tableName} as tar_order`, function() {
                    this.on(`tar_order.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`tar_order.website_id`, RawParam(filter.website_id));
                    this.andOn(`tar_order.channel_id`, RawParam(filter.channel_id));
                })
                .select(QueryBuilder.raw(`coalesce(tar_order.row_index, def_order.row_index) as row_index`))
                .select(QueryBuilder.raw(`coalesce(tar_order.column_index, def_order.column_index) as column_index`));
        }
        query
            .select(`${Selection.tableName}.id`)
            .select(`${Selection.tableName}.status_id`)
            .select(`${Selection.tableName}.market_id`);

        if (filter.market_id) query.where(`${Selection.tableName}.market_id`, filter.market_id);
        if (filter.ids && filter.ids.length) {
            query.whereRaw(`${Selection.tableName}.id = ANY(VALUES(${uniq(filter.ids).join("), (")}))`);
        }
        let selections = await SelectionList.manyOrNone(query);
        if (!isUndefined(filter.name)) {
            selections = selections.filter(selection => (selection.name ? selection.name.toLowerCase().indexOf(<string>filter.name) >= 0 : false));
        }
        if (!isUndefined(filter.alt_name)) {
            selections = selections.filter(selection =>
                selection.alt_name_1 ? selection.alt_name_1.toLowerCase().indexOf(<string>filter.alt_name) >= 0 : false
            );
        }
        return selections;
    }

    public static async find(data: ISelectionFilter): Promise<ISelectionPublic[]> {
        const filter = new SelectionFilter(data);
        const query = QueryBuilder(Selection.tableName).select(`${Selection.tableName}.*`);
        if (filter.include_name) {
            // join names
            query
                .leftJoin(`${SelectionTranslation.tableName} as def_name_tr`, function() {
                    this.on(`def_name_tr.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`def_name_tr.website_id`, RawParam(DEFAULT_WEB_SITE));
                    this.andOn(`def_name_tr.channel_id`, RawParam(ChannelType.BACKEND));
                    this.andOn(`def_name_tr.lang_id`, RawParam(DEFAULT_LANGUAGE));
                })
                .leftJoin(`${SelectionTranslation.tableName} as name_tr`, function() {
                    this.on(`name_tr.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`name_tr.website_id`, RawParam(filter.website_id));
                    this.andOn(`name_tr.channel_id`, RawParam(filter.channel_id));
                    this.andOn(`name_tr.lang_id`, RawParam(filter.lang_id));
                })
                .select(QueryBuilder.raw(`coalesce(name_tr.name, def_name_tr.name) as name`));
            if (filter.name) query.where(`name_tr.name`, filter.name);
        }
        if (filter.include_order) {
            // orders
            query
                .leftJoin(`${SelectionOrder.tableName} as def_order`, function() {
                    this.on(`def_order.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`def_order.website_id`, RawParam(DEFAULT_WEB_SITE));
                    this.andOn(`def_order.channel_id`, RawParam(ChannelType.BACKEND));
                })
                .leftJoin(`${SelectionOrder.tableName} as tar_order`, function() {
                    this.on(`tar_order.selection_id`, `${Selection.tableName}.id`);
                    this.andOn(`tar_order.website_id`, RawParam(filter.website_id));
                    this.andOn(`tar_order.channel_id`, RawParam(filter.channel_id));
                })
                .select(QueryBuilder.raw(`coalesce(tar_order.row_index, def_order.row_index) as row_index`))
                .select(QueryBuilder.raw(`coalesce(tar_order.column_index, def_order.column_index) as column_index`));
        }
        if (filter.market_id) query.where(`${Selection.tableName}.market_id`, filter.market_id);
        if (filter.id) query.where(`${Selection.tableName}.id`, filter.id);
        return SelectionPublic.manyOrNone(query);
    }

    public static async listBase(data: ISelectionFilter): Promise<ISelection[]> {
        const filter = new SelectionFilter(data);
        const query = QueryBuilder(Selection.tableName);
        if (!isNotNumber(filter.market_id)) query.where(`${Selection.tableName}.market_id`, filter.market_id);
        if (!isNotNumber(filter.id)) query.where(`${Selection.tableName}.id`, filter.id);
        if (filter.ids && filter.ids.length) query.whereIn(`${Selection.tableName}.id`, filter.ids);
        return Selection.manyOrNone(query);
    }

    public static async listRules(data: ISelectionFilter): Promise<ISelection[]> {
        const filter = new SelectionFilter(data);
        const query = QueryBuilder(Selection.tableName).select(`${Selection.tableName}.rule`);

        if (isRealString(filter.market_name, 2)) {
            query.join(`${Market.tableName}`, `${Market.tableName}.id`, `${Selection.tableName}.market_id`);
            query
                .join(`${MarketTranslation.tableName}`, `${MarketTranslation.tableName}.market_id`, `${Market.tableName}.id`)
                .where(`${MarketTranslation.tableName}.channel_id`, ChannelType.BACKEND)
                .where(`${MarketTranslation.tableName}.lang_id`, DEFAULT_LANGUAGE)
                .where(`${MarketTranslation.tableName}.name`, "ILIKE", filter.market_name);
        }

        query.where(`${Selection.tableName}.rule`, "<>", "");

        if (filter.market_id) {
            query.select(`${Selection.tableName}.id`);
            query.where(`${Selection.tableName}.market_id`, filter.market_id);
        } else query.groupBy(`${Selection.tableName}.rule`);

        return BaseModel.manyOrNoneRaw(query);
    }
}
