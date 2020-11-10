import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { ISelectionList } from "../interfaces/selection.interface";
import { toNumber } from "lodash";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";

export class SelectionList extends BaseModel implements ISelectionList {
    public static tableName = `market_selection`;
    public id: number;
    public market_id: number;
    public name: string;
    public alt_name_1?: string;
    public column_index: number;
    public row_index: number;
    public status_id: GeneralStatus;

    constructor(data: ISelectionList) {
        super();
        this.id = data.id;
        this.market_id = data.market_id;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
        this.column_index = data.column_index;
        this.row_index = data.row_index;
        this.status_id = toNumber(data.status_id) || GeneralStatus.ACTIVE;
    }
}
