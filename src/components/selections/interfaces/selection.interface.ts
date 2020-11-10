import { IBaseWithLogger, ISaveModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { IUserGlobalLimit } from "../../../../../CommonJS/src/interfaces/model_with_limit_by_trading_mode.interface";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";

export interface ISelection extends IBaseWithLogger, IUserGlobalLimit {
    id?: number;
    market_id: number;
    trading_mode: TradingMode;

    rule?: string;
    cancel_rule?: string;

    bet_delay?: number; // delay in seconds

    allow_mixed_multiplies?: boolean;
    status_id: GeneralStatus;
    combination_max?: number;
    combination_min?: number;
}

export interface ISelectionPublic extends ISelection {
    id: number;
    lang_id: number;
    website_id: number;
    channel_id: ChannelType;
    column_index: number;
    row_index: number;
    name: string;
    alt_name?: string;
    alt_name_1?: string;
}

export interface ISelectionList {
    id: number;
    market_id: number;
    name: string;
    alt_name_1?: string;
    column_index: number;
    row_index: number;
    status_id: GeneralStatus;
}

export interface ISelectionFilter extends ISaveModelWithChannelType {
    id?: number;
    ids?: number[];
    market_id?: number;
    market_name?: string;
    name?: string;
    alt_name?: string;
    lang_id?: number;
    status_id?: GeneralStatus;
    include_name?: boolean;
    include_order?: boolean;
}
