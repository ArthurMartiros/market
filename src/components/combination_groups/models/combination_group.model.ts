import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { ICombinationGroup, ICombinationGroupPublic, ICombinationGroupUpdate } from "../interfaces/combination_group.interface";
import { DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";

export class CombinationGroup extends BaseModel implements ICombinationGroup {
    public static tableName = "combination_group";
    public id: number;
    public category_id: number;
    public order_id?: number;

    constructor(data: ICombinationGroup) {
        super();
        this.id = data.id;
        this.category_id = data.category_id;
        this.order_id = data.order_id;
    }
}

export class CombinationGroupUpdate extends BaseModel implements ICombinationGroupUpdate {
    public static tableName = "combination_group";
    public id: number;
    public order_id?: number;

    constructor(data: ICombinationGroupUpdate) {
        super();
        this.id = data.id;
        this.order_id = data.order_id;
    }
}


export class CombinationGroupPublic extends BaseModel implements ICombinationGroupPublic {
    public id: number;
    public name: string;
    public category_id: number;
    public order_id: number;
    public lang_id: number;

    constructor(data: ICombinationGroupPublic) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.category_id = data.category_id;
        this.order_id = data.order_id || 0;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
    }
}