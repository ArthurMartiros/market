import { FilteredLadderType } from "../enums/ladder.enum";

export interface ILadder {
    id?: number;
    odd: number;
}

export interface ILadderPulic extends ILadder {
    full_count: number;
}

export interface IFilteredLaddersRequest {
    type: FilteredLadderType;

    odd?: number;
}

export interface IFilteredLaddersResponse {
    type: FilteredLadderType;

    min?:  ILadder;
    max?:  ILadder;

    next?: ILadder;
    prev?: ILadder;

}