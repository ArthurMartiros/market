import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { IDisplayTypeTranslation } from "../interfaces/display_type.interface";

export class DisplayTypeTranslation extends BaseModel implements IDisplayTypeTranslation {
    public static tableName = 'display_type_translation';
    public id?: number;
    public display_type_id?: number;
    public lang_id?: number;
    public name: string;
    constructor(data: IDisplayTypeTranslation) {
        super();
        this.id = data.id;
        this.display_type_id = data.display_type_id;
        this.lang_id = data.lang_id;
        this.name = data.name;
    }
}