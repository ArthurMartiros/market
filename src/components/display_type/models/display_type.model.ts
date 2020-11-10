import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { IDisplayType } from "../interfaces/display_type.interface";

export class DisplayTypeModel extends BaseModel implements IDisplayType {
    public static tableName = 'display_type';
    public id: number;
    public sport_id?: number;
    public order_id?: number;
    constructor(data: IDisplayType) {
        super();
        this.id = data.id;
        this.sport_id = data.sport_id;
        this.order_id = data.order_id;
    }
}