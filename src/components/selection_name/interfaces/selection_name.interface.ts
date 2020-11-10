import { ISaveModelWithChannelType, IModelWithChannelType } from "../../../../../CommonJS/src/base/base.interface";

export interface ISelectionTranslation extends ISaveModelWithChannelType {
    id?: number;
    selection_id: number;
    lang_id: number;
    name: string;
    alt_name_1?: string;
}

export interface ISelectionTranslationFilter extends ISaveModelWithChannelType {
    id?: number;
    selection_id?: number;
    lang_id?: number;
    name?: string;
    alt_name_1?: string;
}

export interface ISelectionTranslationModel extends IModelWithChannelType {
    id: number;
    selection_id: number;
    lang_id: number;
    name: string;
    alt_name_1: string;
}
