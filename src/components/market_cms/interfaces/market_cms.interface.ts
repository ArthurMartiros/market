import { ISaveModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";

export interface IMarketCMSTranslation extends ISaveModelWithChannelType {
    market_id: number;
    lang_id: number;
    description_1?: string;
    description_2?: string;
}
