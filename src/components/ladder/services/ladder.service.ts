import { map } from "bluebird";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { ILadder, IFilteredLaddersRequest, IFilteredLaddersResponse } from "../interfaces/ladder.interface";
import { Ladder } from "../models/ladder.model";
import { LadderFilter } from "../filters/ladder.filter";
import { FilteredLadderType } from "../enums/ladder.enum";

export class LadderService {
    async add(data: ILadder): Promise<ILadder> {
        if(!data || !data.odd) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        let ladder = await Ladder.findOne({ odd: data.odd });
        if (ladder) return ladder;
        // save ladder
        return new Ladder(data).saveWithID();
    }

    async get(filter: Partial<LadderFilter>): Promise<ILadder> {
        // create ladder filters instance
        const ladderFilter = new LadderFilter({ id: filter.id });
        // find ladder
        const [ladder] = await ladderFilter.find();
        // return market
        return ladder;
    }

    async getFilteredLadders(request: IFilteredLaddersRequest): Promise<IFilteredLaddersResponse> {
        switch (request.type) {
            case FilteredLadderType.MinAndMax:
                return LadderFilter.findMinAndMaxOdds();
            case FilteredLadderType.PrevAndNext:
                const odd = +<number>request.odd;
                if (!isNaN(odd)) {
                    return LadderFilter.findPrevAndNextOdds(odd);
                }
            default:
                throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        }
    }

    async delete(data: ILadder): Promise<Ladder[]> {
        // find ladder
        const ladder = await this.get({ id: data.id });
        if (!ladder) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        // delete ladder
        return new Ladder(ladder).delete();
    }

    async update(data: ILadder): Promise<ILadder | undefined> {
        // find ladder
        const ladder = await this.get({ id: data.id });
        // if market not found return error
        if (!ladder) throw ErrorUtil.newError(ErrorCodes.NOT_FOUND);
        // update ladder
        return new Ladder(data).update();
    }

    async list(filter: LadderFilter): Promise<ILadder[]> {
        // find ladders
        return await new LadderFilter(filter).find();
    }

    async updateMany(ladders: ILadder[]): Promise<(ILadder | undefined)[]> {
        console.error('ladders -> ',ladders);
        return map(ladders, async ladder => {
            if (ladder.id) return new Ladder(ladder).update();
            else return new Ladder(ladder).saveWithID();
        });
    }
}