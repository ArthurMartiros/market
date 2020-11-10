import { IBetLimits, IOverask } from "../../../../../CommonJS/src/interfaces/model_with_limit_by_trading_mode.interface";

export interface ISelectionSettings extends IBetLimits, IOverask {
    selection_id: number;
}