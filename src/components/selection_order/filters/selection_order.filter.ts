import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { SelectionOrder } from "../models/selection_order.model";
import { ISelectionOrder } from "../interfaces/selection_order.interface";
import { isUndefined } from "util";

export class SelectionOrderFilter extends SelectionOrder {
    public selection_ids?: number[];

    public static findAll(data: ISelectionOrder): Promise<ISelectionOrder[]> {
        const filter = new this(data);
        const query = QueryBuilder(this.tableName)
            .select([
                `selection_id`,
                `row_index`,
                `column_index`,
                `channel_id`
            ])
            .where(`${this.tableName}.website_id`, filter.website_id)
            .where(`${this.tableName}.selection_id`, filter.selection_id);
        return this.manyOrNone(query);
    }

      //get all markets orders
      public static async getAll(filter: Partial<SelectionOrderFilter> = {}): Promise<ISelectionOrder[]> {
        const query = QueryBuilder(this.tableName);
        if(!isUndefined(filter.selection_id)) query.where(`selection_id`, filter.selection_id);
        if(!isUndefined(filter.selection_ids)) query.whereIn(`selection_id`, filter.selection_ids);
        return this.manyOrNone(query);
    }
}