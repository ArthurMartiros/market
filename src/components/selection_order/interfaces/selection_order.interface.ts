import { ISaveModelWithChannelType, IModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";

export interface ISelectionOrder extends ISaveModelWithChannelType {
    id?: number;
    column_index?: number;
    row_index?: number;
    selection_id: number;
}

export interface ISelectionOrderModel extends IModelWithChannelType {
    id: number;
    column_index: number;
    row_index: number;
    selection_id: number;
}