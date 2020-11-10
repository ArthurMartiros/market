import { ISaveModelWithChannelType, IModelWithChannelType, IModelSaveWithLanguage } from "../../../../../CommonJS/src/base/base.interface";

export interface IMarketTranslation extends ISaveModelWithChannelType {
    id?: number;
    market_id: number;
    lang_id: number;
    name: string;
    alt_name_1?: string;
    alt_name_2?: string;
}

export interface IMarketTranslationModel extends IModelWithChannelType, IModelSaveWithLanguage {
    id: number;
    website_id: number;
    channel_id: number;
    lang_id: number;
    market_id: number;
    name: string;
    alt_name_1: string;
    alt_name_2: string;
}

export interface IMarketTranslationFilter extends ISaveModelWithChannelType {
    id?: number;
    market_id?: number;
    event_market_id?: number;
    lang_id?: number;
    name?: string;
    alt_name_1?: string;
    alt_name_2?: string;
}
