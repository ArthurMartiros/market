import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { DEFAULT_WEB_SITE } from "../../../../../CommonJS/src/domain/constant";
import { IMarketOrder } from "../interfaces/market_order.interfaces";
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';

export class MarketOrder extends BaseModelWithLogger implements IMarketOrder {
    public static tableName = "market_order";
    public id?: number;
    public market_id: number;
    public order_id: number;
    public website_id: number;
    public channel_id: ChannelType;

    constructor(data: IMarketOrder, source?: IUser) {
        super(source);
        this.id = data.id;
        this.market_id = data.market_id;
        this.modelId = this.market_id;
        this.order_id = data.order_id || 0;
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
    }
}