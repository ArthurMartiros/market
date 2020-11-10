import { ISaveModelWithChannelType, IModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";

export interface IMarketOrder extends ISaveModelWithChannelType {
    id?: number;
    order_id?: number;
    market_id: number;
}

export interface IMarketOrderModel extends IModelWithChannelType {
    id: number;
    order_id: number;
    market_id: number;
}