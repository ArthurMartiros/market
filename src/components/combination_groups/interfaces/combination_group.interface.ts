export interface ICombinationGroup {
    id: number;
    category_id: number;
    order_id?: number;
}

export interface ICombinationGroupUpdate {
    id: number;
    order_id?: number;
}


export interface ICombinationGroupPublic extends ICombinationGroup {
    name: string;
    lang_id: number;
}

export interface ICombinationGroupTranslation {
    id?: number;
    combination_group_id: number;
    name: string;
    lang_id: number;
}