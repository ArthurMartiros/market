import { merge } from "lodash";
import { IDisplayType, IDisplayTypePublic, IDisplayTypeTranslation } from "../interfaces/display_type.interface";
import { DisplayTypeModel } from "../models/display_type.model";
import { DisplayTypeTranslation } from "../models/display_type_translation.model";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";

export class DisplayTypePublicModel extends DisplayTypeModel implements IDisplayTypePublic {
    public id: number;
    public lang_id?: number;
    public name?: string;
    constructor(data: IDisplayTypePublic) {
        super(data);
        this.id = data.id;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.name = data.name;
    }

    public static async upsert(data: IDisplayTypePublic): Promise<IDisplayTypePublic> {
        const displayType = await new DisplayTypeModel(data).saveWithID();
        const translation = new DisplayTypeTranslation(<IDisplayTypeTranslation>{ display_type_id: displayType.id, name: data.name, lang_id: data.lang_id });
        const displayTypeTranslation = await translation.save();
        return merge(displayType, {
            "name": displayTypeTranslation.name,
            "lang_id": displayTypeTranslation.lang_id
        });
    }

    public async delete(): Promise<this[]> {
        await DisplayTypeTranslation.delete({ display_type_id: this.id });
        return super.delete({ id: this.id });
    }

    public async update(data: IDisplayTypePublic): Promise<this> {
        let displayType,
            displayTypeTranslation;
        const id = data.id;
        displayType = await new DisplayTypeModel(<IDisplayType>data).update({}, { id });
        displayTypeTranslation = await new DisplayTypeTranslation(<IDisplayTypeTranslation>data).update({}, { "display_type_id": id });
        return merge(displayType, {
            "name": displayTypeTranslation.name,
            "lang_id": displayTypeTranslation.lang_id
        });
    }
}