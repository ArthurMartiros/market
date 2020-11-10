import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { IMarketList } from "../interfaces/market.interface";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { GeneralStatus } from '../../../../../CommonJS/src/enums/general_status.enum';

export class MarketList extends BaseModel implements IMarketList {
    public id: number;
    public name: string;
    public order_id: number;
    public status_id: GeneralStatus;
    public category_id: number;
    public trading_mode: TradingMode;
    public sport_default: boolean;

    constructor(data: IMarketList) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.order_id = data.order_id;
        this.status_id = data.status_id;
        this.trading_mode = data.trading_mode;
        this.category_id = data.category_id;
        this.sport_default = data.sport_default;
    }
}
