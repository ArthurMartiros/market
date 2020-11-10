import { IDisplayTypePublic, IDisplayTypeFilter } from "../interfaces/display_type.interface";
import { DisplayTypeModel } from "../models/display_type.model";
import { DisplayTypeTranslation } from "../models/display_type_translation.model";
import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { DisplayTypePublicModel } from "../models/display_type_public.model";
import { toNumber } from "lodash";

export class DisplayTypeFilter extends DisplayTypeModel implements IDisplayTypePublic {
    public id: number;
    public sport_id?: number;
    public order_id?: number;
    public lang_id: number;
    public name?: string;

    constructor(data: IDisplayTypePublic) {
        super(data);
        this.id = data.id;
        this.sport_id = toNumber(data.sport_id);
        this.order_id = data.order_id;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.name = data.name;
    }

    public static async get(filter: IDisplayTypeFilter): Promise<IDisplayTypePublic[]> {
        const query = QueryBuilder(DisplayTypeModel.tableName)
            .select([
                `${DisplayTypeModel.tableName}.id`,
                `${DisplayTypeModel.tableName}.sport_id`,
                `${DisplayTypeModel.tableName}.order_id`,
                `${DisplayTypeTranslation.tableName}.name`,
                `${DisplayTypeTranslation.tableName}.lang_id`
            ])
            .leftJoin(DisplayTypeTranslation.tableName, `${DisplayTypeTranslation.tableName}.display_type_id`, `${DisplayTypeModel.tableName}.id`);
        if (filter.id) query.where(`${DisplayTypeModel.tableName}.id`, filter.id);
        if (filter.ids) query.whereIn(`${DisplayTypeModel.tableName}.id`, filter.ids);
        if (filter.sport_id) query.where(`${DisplayTypeModel.tableName}.sport_id`, filter.sport_id);
        if (filter.name && filter.name.length) query.where(`${DisplayTypeTranslation.tableName}.name`, filter.name);
        if (filter.lang_id) query.where(`${DisplayTypeTranslation.tableName}.lang_id`, filter.lang_id);
        return DisplayTypePublicModel.manyOrNone(query);
    }
}
