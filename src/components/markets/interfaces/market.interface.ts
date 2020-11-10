import { MarketVoid } from "../enums/market_void.enum";
import { IBaseWithLogger, ISaveModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { SourceType } from "../../../../../CommonJS/src/enums/source_type.enum";
import { ISelectionPublic } from "../../selections/interfaces/selection.interface";
import { ICombinationLimit, IUserGlobalLimit } from "../../../../../CommonJS/src/interfaces/model_with_limit_by_trading_mode.interface";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";

export interface IMarket extends IBaseWithLogger, IUserGlobalLimit, ICombinationLimit {
    id?: number;
    category_id?: number;
    status_id?: GeneralStatus;
    scope_id?: number;
    statistic_type_id?: number;
    groups?: number[];
    alert: number[];
    use_provider_odds?: boolean;
    ladder_from?: number;
    ladder_to?: number;
    display_type?: number[];
    restricted_markets: number[];
    auto_create?: boolean;
    trading_mode?: TradingMode;
    winning_count: number;
    time_from: number;
    time_to: number;
    suspension_partly: boolean;
    suspension_before_start: number;
    suspension_after_scope_start: number;
    suspension_before_scope_end: number;
    suspension_any_team_scope: number;
    suspension_both_team_scope: number;
    selections_max?: number;
    selections_min?: number;
    selections_fixed?: number;
    suspension_min_odd?: number;
    suspension_max_odd?: number;
    validateMarket(): void;

    notes: string[];
    void_on_event_cancel?: MarketVoid;
    result_source_id?: SourceType;
    restriction_groups: number[];
    code?: string;
    allow_mixed_multiplies?: boolean;
    sport_default?: boolean;
}

export interface IMarketPublic extends IMarket {
    id: number;
    status_id: GeneralStatus;
    lang_id: number;
    name: string;
    alt_name_1: string;
    alt_name_2: string;
    selections: ISelectionPublic[];
    order_id: number;
    groups: number[];
}

export interface IMarketList {
    id: number;
    name: string;
    order_id: number;
    status_id: GeneralStatus;
    category_id: number;
    trading_mode: TradingMode;
    sport_default: boolean;
}

export interface IMarketFilter extends ISaveModelWithChannelType {
    id?: number;
    category_id?: number;
    name?: string;
    selection_name?: string;
    alt_selection_name?: string;
    trading_mode?: TradingMode;
    groups?: number[];
    alternative_name_1?: string;
    alternative_name_2?: string;
    scope?: number;
    restrictions_groups?: number[];
    resolution_rules?: SourceType;
    combination_min?: number;
    combination_max?: number;
    time_from?: number;
    time_to?: number;
    period_minute_from?: number;
    period_minute_to?: number;
    prematch_overask?: boolean;
    live_overask?: boolean;
    status_id?: GeneralStatus;
    statistic_type_id?: number;
    code?: string;
    ids?: number[];
    lang_id?: number;
    include_selections?: boolean;
    withRestrictionMarketDetails?: boolean;
    limit?: number;
    unlimit?: boolean;
    include_order?: boolean;
    is_admin?: boolean;
    period_name?: string;
}
