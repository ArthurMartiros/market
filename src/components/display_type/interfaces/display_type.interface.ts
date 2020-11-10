import { IBase } from "../../../../../CommonJS/src/base/base.interface";

export interface IDisplayType extends IBase {
    id: number;
    sport_id?: number;
    order_id?: number;
}

export interface IDisplayTypeTranslation extends IBase {
    id?: number;
    name: string;
    display_type_id?: number;
    lang_id?: number;
}

export interface IDisplayTypePublic extends IDisplayType {
    id: number;
    name?: string;
    lang_id?: number;
}

export interface IDisplayTypeFilter {
    id?: number;
    ids: number[];
    sport_id: number;
    name?: string;
    lang_id?: number;
}