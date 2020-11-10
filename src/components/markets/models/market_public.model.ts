import { IMarketPublic } from "../interfaces/market.interface";
import { Market } from "./market.model";
import { ISelectionPublic } from "../../selections/interfaces/selection.interface";
import { ValueType } from "../../../../../CommonJS/src/enums/limit_value_type.enum";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";

export class MarketPublic extends Market implements IMarketPublic {
    public id: number;
    public status_id: GeneralStatus;
    public category_id: number;
    public lang_id: number;
    public name: string;
    public alt_name_1: string;
    public alt_name_2: string;
    public selections: ISelectionPublic[];
    public order_id: number;
    public overask: boolean;
    public overask_won_max_limit: number;
    public overask_won_min_limit: number;
    public overask_stake_max_limit: number;
    public overask_stake_min_limit: number;
    public groups: number[];
    public user_won_limit: number;
    public user_won_limit_local: number;
    public user_won_limit_value_type: ValueType;
    public user_stake_limit: number;
    public user_stake_limit_local: number;
    public user_stake_limit_value_type: ValueType;
    public trading_mode: TradingMode;
    public sport_default: boolean;

    constructor(data: IMarketPublic) {
        super(data);
        this.id = data.id;
        this.lang_id = data.lang_id;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
        this.alt_name_2 = data.alt_name_2;
        this.selections = data.selections;
        this.order_id = data.order_id;
    }
}
