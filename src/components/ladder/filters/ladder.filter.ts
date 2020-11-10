import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { toNumber, round } from "lodash";
import { ILadder, ILadderPulic, IFilteredLaddersResponse } from "../interfaces/ladder.interface";
import { Ladder, LadderPublic } from "../models/ladder.model";
import { FilteredLadderType } from "../enums/ladder.enum";

export class LadderFilter {
    public id?: number;
    public from?: number;
    public to?: number;

    constructor(data: Partial<LadderFilter>) {
        this.id = data.id;
        this.from = data.from;
        this.to = data.to;
    }

    public async find(): Promise<ILadderPulic[]> {
        const query = QueryBuilder(Ladder.tableName)
            .select('*')
            .select(QueryBuilder.raw('count(*) OVER() AS full_count'))
            .orderBy('odd');
        if (this.id) query.where('id', this.id);
        if (this.from) query.where('odd', '>=', this.from);
        if (this.to) query.where('odd', '<=', this.to);
        // execute query
        return LadderPublic.manyOrNone(query);
    }

    public async findNearest(odd: number): Promise<ILadder | undefined> {
        odd = toNumber(odd);
        const query = `
        SELECT * FROM
        (
          (SELECT id, odd FROM ladder WHERE odd >= ? ORDER BY odd LIMIT 1) AS above
          UNION ALL
          (SELECT id, odd FROM ladder WHERE odd < ? ORDER BY odd DESC LIMIT 1) as below
        ) 
        ORDER BY abs(?-odd) LIMIT 1;
        `;
        // execute query
        const output = await Ladder.oneOrNone(query);
        if (!output) return;
        // return markets
        const ladder = new Ladder(output);
        // if difference too much return current odd but rounded with 2 precision
        if (Math.abs(ladder.odd - odd) > 0.5) return new Ladder({ odd: round(odd, 2) });
        // return ladder
        return ladder;
    }

    public static async findMinAndMaxOdds(): Promise<IFilteredLaddersResponse> {
        const minQuery = QueryBuilder.raw(`
            SELECT 
                l.id AS id,
                MIN(l.odd) AS odd
            FROM ${Ladder.tableName} AS l
            GROUP BY l.id
            ORDER BY l.odd DESC
            LIMIT 1
            OFFSET 0
        `);
        const maxQuery = QueryBuilder.raw(`
            SELECT 
                l.id       AS id, 
                MAX(l.odd) AS odd
            FROM ${Ladder.tableName} AS l
            GROUP BY l.id
            ORDER BY l.odd ASC
            LIMIT 1
            OFFSET 0
        `);

        const minLadder: ILadder | undefined = await Ladder.oneOrNone(minQuery);
        const maxLadder: ILadder | undefined = await Ladder.oneOrNone(maxQuery);
        return { 
            type: FilteredLadderType.MinAndMax,

            min: minLadder, 
            max: maxLadder, 
        } as IFilteredLaddersResponse;
    }

    public static async findPrevAndNextOdds(odd: number): Promise<IFilteredLaddersResponse> {
        const prevQuery = QueryBuilder.raw(`
            SELECT 
                l.id  AS id,
                l.odd AS odd
            FROM ${Ladder.tableName} AS l
            WHERE l.odd < ${odd}
            GROUP BY l.id
            ORDER BY l.odd DESC
            LIMIT 1
            OFFSET 0
        `);
        const nextQuery = QueryBuilder.raw(`
            SELECT 
                l.id  AS id, 
                l.odd AS odd
            FROM ${Ladder.tableName} AS l
            WHERE l.odd > ${odd}
            GROUP BY l.id
            ORDER BY l.odd ASC
            LIMIT 1
            OFFSET 0
        `);

        const prevLadder: ILadder | undefined = await Ladder.oneOrNone(prevQuery);
        const nextLadder: ILadder | undefined = await Ladder.oneOrNone(nextQuery);
        return { 
            type: FilteredLadderType.PrevAndNext,
            
            prev: prevLadder,
            next: nextLadder, 
        } as IFilteredLaddersResponse;
    }
}