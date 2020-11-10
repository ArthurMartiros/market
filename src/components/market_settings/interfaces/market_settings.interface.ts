import { IBetLimits, IBetDelay, IMargin, ISuspensionOddLimit, IAcceptBet, IOverask } from "../../../../../CommonJS/src/interfaces/model_with_limit_by_trading_mode.interface";

export interface IMarketSettings extends IBetLimits, IBetDelay, IMargin, ISuspensionOddLimit, IAcceptBet, IOverask {
    market_id: number;
    category_id?: number;
    sport_id?: number;
    market_name?: string;
}