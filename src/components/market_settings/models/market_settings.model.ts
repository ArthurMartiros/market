import { toBoolean, toNumberIfExists } from '../../../../../CommonJS/src/utils/validators';
import { ValueType } from '../../../../../CommonJS/src/enums/limit_value_type.enum';
import { TradingMode } from '../../../../../CommonJS/src/enums/trading_mode.enum';
import { IMarketSettings } from '../interfaces/market_settings.interface';
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';
import { toNumber } from 'lodash';
// import { isUndefined } from "util";

export class MarketSettings extends BaseModelWithLogger implements IMarketSettings {
    public static tableName = 'market_settings';
    public id?: number;
    public market_id: number;
    public trading_mode: TradingMode;
    public accept_bets_before_start?: number;
    public override_accept_bets_before_start?: boolean;
    public suspension_min_odd?: number;
    public suspension_max_odd?: number;
    public bet_delay?: number;
    public override_bet_delay?: boolean;

    public bet_won_limit?: number;
    public bet_won_limit_local?: number;
    public bet_won_limit_value_type?: ValueType;
    public override_won_limit?: boolean;

    public bet_stake_limit?: number;
    public bet_stake_limit_local?: number;
    public bet_stake_limit_value_type?: ValueType;
    public override_stake_limit?: boolean;

    public overask?: boolean;
    public overask_won_max_limit?: number;
    public overask_won_min_limit?: number;
    public overask_stake_max_limit?: number;
    public overask_stake_min_limit?: number;
    public category_id?: number;
    public market_name?: string;

    constructor(data: IMarketSettings, source?: IUser) {
        super(source);
        this.id = toNumber(data.id);
        this.market_id = toNumber(data.market_id);
        // this.modelId = this.market_id;
        this.trading_mode = toNumber(data.trading_mode);
        this.accept_bets_before_start = toNumber(data.accept_bets_before_start) || 0;
        this.override_accept_bets_before_start = toBoolean(data.override_accept_bets_before_start);

        this.suspension_min_odd = toNumber(data.suspension_min_odd) || undefined;
        this.suspension_max_odd = toNumber(data.suspension_max_odd) || undefined;

        this.bet_delay = this.trading_mode === TradingMode.LIVE ? toNumber(data.bet_delay) || 0 : 0;
        this.override_bet_delay = toBoolean(data.override_bet_delay);

        this.bet_won_limit = toNumber(data.bet_won_limit) || 1000000;
        this.bet_won_limit_local = toNumber(data.bet_won_limit_local) || 100;
        this.bet_won_limit_value_type = data.bet_won_limit_value_type || ValueType.PERCENT;
        this.override_won_limit = toBoolean(data.override_won_limit, false);

        this.bet_stake_limit = toNumber(data.bet_stake_limit) || 100000;
        this.bet_stake_limit_local = toNumber(data.bet_stake_limit_local) || 100;
        this.bet_stake_limit_value_type = data.bet_stake_limit_value_type || ValueType.PERCENT;
        this.override_stake_limit = toBoolean(data.override_stake_limit, false);

        this.overask_won_max_limit = toNumber(data.overask_won_max_limit) || 10000;
        this.overask_won_min_limit = toNumber(data.overask_won_min_limit) || 0;
        this.overask_stake_max_limit = toNumber(data.overask_stake_max_limit) || 10000;
        this.overask_stake_min_limit = toNumber(data.overask_stake_min_limit) || 0;
        this.overask = toBoolean(data.overask, true);
        this.category_id = toNumberIfExists(data.category_id);
        this.market_name = data.market_name;
    }
}