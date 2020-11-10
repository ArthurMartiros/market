import { BaseModelWithLogger } from "../../../../../CommonJS/src/base/baseWithLoger.model";
import { toNumber } from "lodash";
import { ISelection } from "../interfaces/selection.interface";
import { ValueType } from "../../../../../CommonJS/src/enums/limit_value_type.enum";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { toBoolean } from "../../../../../CommonJS/src/utils/validators";
import { isUndefined } from "util";
import { IUser } from "../../../../../CoreService/src/components/users/interfaces/user.interface";
import { GeneralStatus } from "../../../../../CommonJS/src/enums/general_status.enum";

export class Selection extends BaseModelWithLogger implements ISelection {
    public static tableName = "market_selection";
    public id?: number;
    public market_id: number;
    public trading_mode: TradingMode;

    public rule?: string;
    public cancel_rule?: string;

    public bet_delay?: number; // delay in seconds
    public user_won_limit?: number;
    public user_won_limit_local?: number;
    public user_stake_limit?: number;
    public user_stake_limit_local?: number;
    public user_won_limit_value_type?: ValueType;
    public user_stake_limit_value_type?: ValueType;
    public override_user_won_limit?: boolean;
    public override_user_stake_limit?: boolean;

    public allow_mixed_multiplies?: boolean;

    public status_id: GeneralStatus;
    public combination_max?: number;
    public combination_min?: number;

    constructor(data: ISelection, source?: IUser) {
        super(source);
        this.id = data.id;
        this.market_id = data.market_id;
        if (!isUndefined(data.trading_mode)) this.trading_mode = data.trading_mode;

        this.rule = data.rule;
        this.cancel_rule = data.cancel_rule;

        this.bet_delay = toNumber(data.bet_delay) || 0;
        this.override_user_won_limit = toBoolean(data.override_user_won_limit);
        this.override_user_stake_limit = toBoolean(data.override_user_stake_limit);
        this.user_won_limit_value_type = toNumber(data.user_won_limit_value_type) || ValueType.PERCENT;
        this.user_won_limit = toNumber(data.user_won_limit) || 0;
        this.user_won_limit_local =
            this.user_won_limit_value_type === ValueType.PERCENT ? toNumber(data.user_won_limit_local) || 100 : toNumber(data.user_won_limit_local) || 0;
        this.user_stake_limit_value_type = toNumber(data.user_stake_limit_value_type) || ValueType.PERCENT;
        this.user_stake_limit = toNumber(data.user_stake_limit) || 0;
        this.user_stake_limit_local =
            this.user_stake_limit_value_type === ValueType.PERCENT ? toNumber(data.user_stake_limit_local) || 100 : toNumber(data.user_stake_limit_local) || 0;

        this.allow_mixed_multiplies = toBoolean(data.allow_mixed_multiplies, true);
        this.status_id = toNumber(data.status_id) || GeneralStatus.ACTIVE;
        this.combination_max = data.combination_max;
        this.combination_min = data.combination_min;
    }

    // public async update(data?: Partial<ISelection>): Promise<this> {
    //     if (!isUndefined(data)) {
    //         if (!isUndefined(data.override_user_stake_limit)) {
    //             if (data.override_user_stake_limit) {
    //                 if (toNumber(data.user_stake_limit_value_type) === ValueType.ABSOLUTE) data.user_stake_limit = data.user_stake_limit_local;
    //                 else data.user_stake_limit = 0;
    //             } else {
    //                 data.user_stake_limit = 0;
    //             }
    //         }
    //         if (!isUndefined(data.override_user_won_limit)) {
    //             if (data.override_user_won_limit) {
    //                 if (toNumber(data.user_won_limit_value_type) === ValueType.ABSOLUTE) data.user_won_limit = data.user_won_limit_local;
    //                 else data.user_won_limit = 0;
    //             } else {
    //                 data.user_won_limit = 0;
    //             }
    //         }
    //     }
    //     return super.update(data);
    // }
}
