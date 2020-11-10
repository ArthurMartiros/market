import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { ISelectionTranslation, ISelectionTranslationFilter } from "../interfaces/selection_name.interface";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { SelectionTranslation } from "../models/selection_name.model";
import { isUndefined } from "lodash";

export class SelectionNameFilter implements ISelectionTranslationFilter {
    public id?: number;
    public selection_id?: number;
    public selection_ids?: number[];
    public lang_id?: number;
    public name?: string;
    public alt_name_1?: string;
    public website_id?: number;
    public channel_id?: ChannelType;
    constructor(data: ISelectionTranslationFilter) {
        this.id = data.id;
        this.selection_id = data.selection_id;
        this.lang_id = data.lang_id;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
        this.website_id = data.website_id;
        this.channel_id = data.channel_id;
    }
    public static async findAll(data: ISelectionTranslationFilter): Promise<ISelectionTranslation[]> {
        const filter = new SelectionNameFilter(data);
        const query = QueryBuilder(SelectionTranslation.tableName);
        if (filter.selection_id) query.where(`selection_id`, filter.selection_id);
        if (filter.website_id) query.where(`website_id`, filter.website_id);
        if (filter.lang_id) query.where(`lang_id`, filter.lang_id);
        return SelectionTranslation.manyOrNone(query);
    }

    //get all selections translations
    public static async getAll(filter: Partial<SelectionNameFilter> = {}): Promise<ISelectionTranslation[]> {
        const query = QueryBuilder(SelectionTranslation.tableName);
        if (!isUndefined(filter.selection_id)) query.where(`selection_id`, filter.selection_id);
        if (!isUndefined(filter.selection_ids)) query.whereIn(`selection_id`, filter.selection_ids);
        return SelectionTranslation.manyOrNone(query);
    }
}
