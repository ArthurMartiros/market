import { QueryBuilder, RawParam } from "../../../../../CommonJS/src/base/base.model";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { uniq, toNumber } from "lodash";
import { ICombinationGroupPublic } from "../interfaces/combination_group.interface";
import { CombinationGroup, CombinationGroupPublic } from "../models/combination_group.model";
import { isArray } from 'util';
import { CombinationGroupTranslation } from '../models/combination_group_translation.model';

export class CombinationGroupFilter {
    public id?: number;
    public ids?: number[];
    public name?: string;
    public lang_id?: number;
    public category_id?: number;

    constructor(data: Partial<CombinationGroupFilter>) {
        this.id = data.id;
        this.ids = data.ids;
        // remove duplicates
        if (isArray(this.ids) && this.ids.length > 0) this.ids = uniq(this.ids);
        this.name = data.name;
        this.lang_id = toNumber(data.lang_id) || DEFAULT_LANGUAGE;
        this.category_id = data.category_id;
    }

    public async find(): Promise<ICombinationGroupPublic[]> {
        const query = QueryBuilder(CombinationGroup.tableName)
            .orderBy(`${CombinationGroup.tableName}.order_id`)
            .select(`${CombinationGroup.tableName}.*`);
        const lang_id = this.lang_id;

        if (lang_id !== DEFAULT_LANGUAGE) {
            query.leftJoin(`${CombinationGroupTranslation.tableName} as def_tr`, function () {
                this.on(`def_tr.combination_group_id`, `=`, `${CombinationGroup.tableName}.id`);
                this.andOn(`def_tr.lang_id`, `=`, RawParam(DEFAULT_LANGUAGE));
            });
            query.leftJoin(`${CombinationGroupTranslation.tableName} as tr`, function () {
                this.on(`tr.combination_group_id`, `=`, `${CombinationGroup.tableName}.id`);
                this.andOn(`tr.lang_id`, `=`, RawParam(lang_id as number));
            });
            query.select(QueryBuilder.raw('coalesce(tr.name, def_tr.name) as name'))
                .select(QueryBuilder.raw('coalesce(tr.lang_id, def_tr.lang_id) as lang_id'));
            if (this.name) query.where(QueryBuilder.raw(`(def_tr.name ilike '%${this.name}%' or tr.name ilike '%${this.name}%')`));
        } else {
            query.leftJoin(`${CombinationGroupTranslation.tableName} as tr`, function () {
                this.on(`tr.combination_group_id`, `=`, `${CombinationGroup.tableName}.id`);
                this.andOn(`tr.lang_id`, `=`, RawParam(lang_id as number));
            });
            query.select(`tr.name`)
                .select(`tr.lang_id`);
            if (this.name) query.where(`tr.name`, `ilike`, `%${this.name}%`);
        }

        if (this.id) query.where(`${CombinationGroup.tableName}.id`, this.id);
        if (this.ids) query.whereIn(`${CombinationGroup.tableName}.id`, this.ids);
        if (this.category_id) query.where(`${CombinationGroup.tableName}.category_id`, this.category_id);

        // execute query
        return CombinationGroupPublic.manyOrNone(query);
    }
}