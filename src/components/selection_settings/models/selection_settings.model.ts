import { toBoolean } from "../../../../../CommonJS/src/utils/validators";
import { ValueType } from "../../../../../CommonJS/src/enums/limit_value_type.enum";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { ISelectionSettings } from "../interfaces/selection_settings.interface";
import { BaseModelWithLogger } from "../../../../../CommonJS/src/base/baseWithLoger.model";
import { IUser } from "../../../../../CoreService/src/components/users/interfaces/user.interface";
import { toNumber } from "lodash";

export class SelectionSettings extends BaseModelWithLogger implements ISelectionSettings {
    public static tableName = "selection_settings";
    public id?: number;
    public selection_id: number;
    public trading_mode: TradingMode;

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

    constructor(data: ISelectionSettings, source?: IUser) {
        super(source);
        this.id = toNumber(data.id);
        this.selection_id = toNumber(data.selection_id);
        this.modelId = this.selection_id;
        this.trading_mode = toNumber(data.trading_mode);
        this.bet_won_limit = toNumber(data.bet_won_limit) || 1000000;
        this.bet_won_limit_local = toNumber(data.bet_won_limit_local) || 100;
        this.bet_won_limit_value_type = toNumber(data.bet_won_limit_value_type) || ValueType.PERCENT;
        this.override_won_limit = toBoolean(data.override_won_limit);
        this.bet_stake_limit = toNumber(data.bet_stake_limit) || 100000;
        this.bet_stake_limit_local = toNumber(data.bet_stake_limit_local) || 100;
        this.bet_stake_limit_value_type = toNumber(data.bet_stake_limit_value_type) || ValueType.PERCENT;
        this.override_stake_limit = toBoolean(data.override_stake_limit);
        this.overask_won_max_limit = toNumber(data.overask_won_max_limit) || 10000;
        this.overask_won_min_limit = toNumber(data.overask_won_min_limit) || 0;
        this.overask_stake_max_limit = toNumber(data.overask_stake_max_limit) || 10000;
        this.overask_stake_min_limit = toNumber(data.overask_stake_min_limit) || 0;
        this.overask = toBoolean(data.overask, true);
    }
}
