import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { DEFAULT_WEB_SITE } from "../../../../../CommonJS/src/domain/constant";
import { ISelectionOrder } from "../interfaces/selection_order.interface";
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';

export class SelectionOrder extends BaseModelWithLogger implements ISelectionOrder {
    public static tableName = "selection_order";
    public id?: number;
    public selection_id: number;
    public column_index?: number;
    public row_index?: number;
    public website_id: number;
    public channel_id: ChannelType;

    constructor(data: ISelectionOrder, source?: IUser) {
        super(source);
        this.id = data.id;
        this.selection_id = data.selection_id;
        this.modelId = this.selection_id;
        this.column_index = data.column_index;
        this.row_index = data.row_index;
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
    }
}