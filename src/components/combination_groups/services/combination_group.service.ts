import { map } from "bluebird";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isString, merge } from "lodash";
import { ICombinationGroupPublic } from "../interfaces/combination_group.interface";
import { CombinationGroup, CombinationGroupPublic, CombinationGroupUpdate } from "../models/combination_group.model";
import { CombinationGroupFilter } from "../filters/combination_group.filter";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { CombinationGroupTranslation } from '../models/combination_group_translation.model';

export class CombinationGroupService {
    async add(data: ICombinationGroupPublic): Promise<ICombinationGroupPublic> {
        // validate request
        if (!data || !isString(data.name) || isNotNumber(data.category_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find group if exists
        let [group] = await new CombinationGroupFilter({ name: data.name, lang_id: data.lang_id, category_id: data.category_id }).find();
        // if found return it
        if (group) return group;
        // if language missing set default language
        if (data.lang_id === undefined) data.lang_id = DEFAULT_LANGUAGE;
        const newGroup = new CombinationGroup(data);
        // save group
        await newGroup.saveWithID();
        // save translation
        const translate = new CombinationGroupTranslation({ combination_group_id: newGroup.id, lang_id: data.lang_id, name: data.name });
        await translate.saveWithID();
        // return public group
        return new CombinationGroupPublic({
            id: newGroup.id,
            category_id: newGroup.category_id,
            lang_id: translate.lang_id,
            name: translate.name,
            order_id: newGroup.order_id
        });
    }

    async get(filter: Partial<CombinationGroupFilter>): Promise<ICombinationGroupPublic | undefined> {
        // find group
        const [group] = await this.list({ id: filter.id });
        // return group
        return group;
    }

    async delete(data: ICombinationGroupPublic): Promise<void> {
        if (isNotNumber(data.id)) throw Error("invalid id");
        // find market
        const group = await this.get({ id: data.id });
        if (!group) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        // delete group
        await new CombinationGroup(group).delete();
        // delete translations
        await CombinationGroupTranslation.delete({ combination_group_id: group.id });
    }

    async update(data: ICombinationGroupPublic): Promise<ICombinationGroupPublic> {
        if (isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        if(data.order_id && isNotNumber(data.order_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market
        const group = await this.get({ id: data.id });
        // if market not found return error
        if (!group) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        // update translation
        if (data.name !== group.name) {
            await CombinationGroupTranslation.update({ name: data.name }, { lang_id: data.lang_id || DEFAULT_LANGUAGE, combination_group_id: group.id });
            group.name = data.name;
        }
        // update group
        return merge(group, await new CombinationGroupUpdate(data).update());
    }

    async list(filter: Partial<CombinationGroupFilter>): Promise<ICombinationGroupPublic[]> {
        return new CombinationGroupFilter(filter).find();
    }

    async updateMany(groups: ICombinationGroupPublic[]): Promise<ICombinationGroupPublic[]> {
        return map(groups, group => this.update(group));
    }
}