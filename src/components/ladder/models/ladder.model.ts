import { BaseModel } from "../../../../../CommonJS/src/base/base.model";
import { ILadder, ILadderPulic } from "../interfaces/ladder.interface";
import { toNumber } from "lodash";

export class Ladder extends BaseModel implements ILadder {
    public static tableName = "ladder";
    public id?: number;
    public odd: number;

    constructor(data: ILadder) {
        super();
        this.id = data.id;
        this.odd = toNumber(data.odd);
    }
}

export class LadderPublic extends Ladder implements ILadderPulic {
    public full_count: number;

    constructor(data: ILadderPulic) {
        super(data);
        this.full_count = data.full_count;
    }
}