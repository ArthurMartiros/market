import { BaseModel } from '../../../../../CommonJS/src/base/base.model';
import { ICombinationGroupTranslation } from '../interfaces/combination_group.interface';
import { toNumber } from 'lodash';
import { DEFAULT_LANGUAGE } from '../../../../../CommonJS/src/domain/constant';

export class CombinationGroupTranslation extends BaseModel implements ICombinationGroupTranslation {
    public static tableName = `combination_group_translation`;
    public id?: number;
    public combination_group_id: number;
    public name: string;
    public lang_id: number;

    constructor(data: ICombinationGroupTranslation) {
        super();
        this.id = data.id;
        this.combination_group_id = toNumber(data.combination_group_id);
        this.name = data.name;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
    }
}