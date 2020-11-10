import { IMarket } from '../interfaces/market.interface';
import { ErrorCodes, ErrorUtil } from '../../../../../CommonJS/src/messaging/ErrorCodes';
import { toNumber } from 'lodash';
import { isNotNumber, toBoolean, toNumberIfExists } from '../../../../../CommonJS/src/utils/validators';
import { ValueType } from '../../../../../CommonJS/src/enums/limit_value_type.enum';
import { TradingMode } from '../../../../../CommonJS/src/enums/trading_mode.enum';
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { SourceType } from '../../../../../CommonJS/src/enums/source_type.enum';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';
import { MarketVoid } from '../enums/market_void.enum';
import { GeneralStatus } from '../../../../../CommonJS/src/enums/general_status.enum';

export class Market extends BaseModelWithLogger implements IMarket {
    public static tableName = 'market';
    public id?: number;
    public category_id?: number;
    public status_id?: GeneralStatus;
    public scope_id?: number;
    public statistic_type_id?: number;
    public groups?: number[];
    public alert: number[];
    public use_provider_odds?: boolean;
    public ladder_from?: number;
    public ladder_to?: number;
    public display_type?: number[];
    public restricted_markets: number[];
    public auto_create?: boolean;
    public trading_mode?: TradingMode;
    public winning_count: number;
    public time_from: number;
    public time_to: number;
    public suspension_partly: boolean;
    public suspension_before_start: number;
    public suspension_after_scope_start: number;
    public suspension_before_scope_end: number;
    public suspension_any_team_scope: number;
    public suspension_both_team_scope: number;
    public suspension_min_odd?: number;
    public suspension_max_odd?: number;
    public combination_max?: number;
    public combination_min?: number;
    public selections_max?: number;
    public selections_min?: number;
    public selections_fixed?: number;
    public notes: string[];
    public void_on_event_cancel?: MarketVoid;
    public result_source_id?: SourceType;
    public user_won_limit?: number;
    public user_won_limit_local?: number;
    public user_won_limit_value_type?: ValueType;
    public user_stake_limit?: number;
    public user_stake_limit_local?: number;
    public user_stake_limit_value_type?: ValueType;
    public override_user_won_limit?: boolean;
    public override_user_stake_limit?: boolean;
    public restriction_groups: number[];
    public code?: string;
    public allow_mixed_multiplies?: boolean;
    public sport_default?: boolean;

    constructor(data: IMarket, source?: IUser) {
        super(source);

        this.id = data.id;
        this.category_id = data.category_id;
        this.status_id = data.status_id;
        this.scope_id = data.scope_id;
        this.statistic_type_id = data.statistic_type_id;
        this.alert = data.alert;
        this.use_provider_odds = toBoolean(data.use_provider_odds, true);
        this.ladder_from = data.ladder_from;
        this.ladder_to = data.ladder_to;
        if (!data.trading_mode) data.trading_mode = TradingMode.PREMATCH;
        this.trading_mode = data.trading_mode;
        this.winning_count = toNumber(data.winning_count) || 1;
        this.time_from = data.time_from;
        this.time_to = data.time_to;

        this.suspension_partly = toBoolean(data.suspension_partly, false);
        this.suspension_before_start = toNumber(data.suspension_before_start) || 0;
        this.suspension_after_scope_start = data.suspension_after_scope_start;
        this.suspension_before_scope_end = data.suspension_before_scope_end;
        this.suspension_any_team_scope = data.suspension_any_team_scope;
        this.suspension_both_team_scope = data.suspension_both_team_scope;
        this.suspension_min_odd = toNumberIfExists(data.suspension_min_odd);
        this.suspension_max_odd = toNumberIfExists(data.suspension_max_odd);
        this.selections_max = data.selections_max;
        this.selections_min = data.selections_min;
        this.selections_fixed = data.selections_fixed;
        this.notes = data.notes;
        this.void_on_event_cancel = toNumber(data.void_on_event_cancel) in MarketVoid ? data.void_on_event_cancel : MarketVoid.YES;

        this.groups = data.groups || [];
        this.restricted_markets = data.restricted_markets || [];
        this.display_type = data.display_type || [];
        this.auto_create = toBoolean(data.auto_create, false);
        this.combination_max = toNumber(data.combination_max) || 0;
        this.combination_min = toNumber(data.combination_min) || 0;
        this.result_source_id = toNumber(data.result_source_id) || 1;
        this.user_won_limit = toNumber(data.user_won_limit) || 0;
        this.user_won_limit_value_type = toNumber(data.user_won_limit_value_type) || ValueType.PERCENT;
        this.user_won_limit_local = this.user_won_limit_value_type === ValueType.PERCENT ? toNumber(data.user_won_limit_local) || 100 : toNumber(data.user_won_limit_local) || 0;
        this.user_stake_limit = toNumber(data.user_stake_limit) || 0;
        this.user_stake_limit_value_type = toNumber(data.user_stake_limit_value_type) || ValueType.PERCENT;
        this.user_stake_limit_local = this.user_stake_limit_value_type === ValueType.PERCENT ? (toNumber(data.user_stake_limit_local) || 100) : (toNumber(data.user_stake_limit_local) || 0);
        this.override_user_won_limit = toBoolean(data.override_user_won_limit);
        this.override_user_stake_limit = toBoolean(data.override_user_stake_limit);
        this.restriction_groups = data.restriction_groups || [];

        this.code = data.code;

        this.allow_mixed_multiplies = toBoolean(data.allow_mixed_multiplies, true);
        // TODO uncoment next logic after life implementation
        this.sport_default = toBoolean(data.sport_default);
        // if (toNumber(this.trading_mode) === TradingMode.PREMATCH) {
        //     this.sport_default = false;
        // } else {
        //     this.sport_default = toBoolean(data.sport_default);
        // }
    }

    public validateMarket(): void {
        if (!isNotNumber(this.selections_fixed)) {
            if (!isNotNumber(this.selections_max)) throw ErrorUtil.newError(ErrorCodes.SELECTION_FIXED_MAX_INVALID);
            if (!isNotNumber(this.selections_min)) throw ErrorUtil.newError(ErrorCodes.SELECTION_FIXED_MIN_INVALID);
        }
        if ((!isNotNumber(this.selections_max) && !isNotNumber(this.selections_min)) &&
            toNumber(this.selections_max) <= toNumber(this.selections_min)) throw ErrorUtil.newError(ErrorCodes.SELECTION_FIXED_MIN_MAX_CONFLICT);
    }
}