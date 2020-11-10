import { IDynamicLimit } from "../../../../../CommonJS/src/interfaces/model_with_limit_by_trading_mode.interface";

export interface IMarketDynamicLimit extends IDynamicLimit {
    market_id: number;
}