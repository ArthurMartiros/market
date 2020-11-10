import { IDisplayTypePublic, IDisplayTypeFilter } from "../interfaces/display_type.interface";
import { DisplayTypePublicModel } from "../models/display_type_public.model";
import { DisplayTypeFilter } from "../filters/display_type.filter";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isNotNumber, isRealString } from "../../../../../CommonJS/src/utils/validators";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { map } from "bluebird";

export class DisplayTypeService {
    async list(filter: IDisplayTypeFilter): Promise<IDisplayTypePublic[]> {
        return DisplayTypeFilter.get(filter);
    }

    async get(filter: IDisplayTypeFilter): Promise<IDisplayTypePublic | undefined> {
        if (isNotNumber(filter.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const [displayType] = await this.list(filter);
        return displayType;
    }

    async add(data: IDisplayTypePublic): Promise<IDisplayTypePublic> {
        // validate request
        if (!data || !isRealString(data.name, 1) || isNotNumber(data.sport_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market display type
        let [displayType] = await this.list(<IDisplayTypeFilter>{ name: data.name, sport_id: data.sport_id });
        // if finded return
        if (displayType) return displayType;
        // set to default language
        if (!data.lang_id) data.lang_id = DEFAULT_LANGUAGE;
        return DisplayTypePublicModel.upsert(data);
    }

    async update(data: IDisplayTypePublic): Promise<IDisplayTypePublic | undefined> {
        if (isNotNumber(data.id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market display type
        const currentDisplayType = await this.get(<IDisplayTypeFilter>{ id: data.id });
        // if market not found return error
        if (!currentDisplayType) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        return currentDisplayType.update(data);
    }

    async delete(data: IDisplayTypePublic): Promise<void> {
        if (!data.id) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        // find market display type by filter
        const displayType = await this.get(<IDisplayTypeFilter>{ id: data.id });
        if (!displayType) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        await displayType.delete();
    }

    async updateMany(types: IDisplayTypePublic[]): Promise<IDisplayTypePublic[]> {
        return map(types, async type => Object.assign(type, await this.update(type)));
    }
}
