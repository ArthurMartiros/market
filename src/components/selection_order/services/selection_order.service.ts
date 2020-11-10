import { ISelectionOrder } from "../interfaces/selection_order.interface";
import { SelectionOrder } from "../models/selection_order.model";
import { SelectionOrderFilter } from "../filters/selection_order.filter";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { map } from "bluebird";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isUndefined } from "util";
import { SelectionFilter } from "../../selections/filters/selection.filter";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { broker } from "../../../../../CommonJS/src/base/base.model";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { cloneDeep } from "lodash";

export class SelectionOrderService extends ServiceWithRequestInfo {
    public async getAll(selection_id: number): Promise<ISelectionOrder[]> {
        if (isNotNumber(selection_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const [selection] = await SelectionFilter.listBase({ id: selection_id });
        if (isUndefined(selection)) throw ErrorUtil.newError(ErrorCodes.SELECTION_DOES_NOT_EXISTS);
        return SelectionOrderFilter.findAll(Object.assign(this.requestInfo, { selection_id }));
    }

    public async updateMany(selection_id: number, data: ISelectionOrder[], website_id?: number, checkToUpdateCache: boolean = true) {
        return map(
            data,
            async channel => {
                channel.website_id = website_id || this.requestInfo.website_id;
                channel.selection_id = selection_id;
                if (!channel.column_index || !channel.row_index) {
                    const order = await SelectionOrder.one(`
                    select coalesce(max(row_index) + 1, 1) as row_index 
                    from selection_order 
                    join market_selection s1 on s1.id = selection_order.selection_id
                    join market_selection s2 on s2.market_id = s1.market_id
                    where s2.id = ${selection_id}`);
                    channel.row_index = order.row_index;
                }
                const byFields = {
                    selection_id: channel.selection_id,
                    channel_id: channel.channel_id,
                    website_id: channel.website_id
                };
                const selectionOrder = await SelectionOrder.findOne(byFields);
                const beforeUpdate = cloneDeep(selectionOrder);
                let res;

                if (selectionOrder) {
                    selectionOrder.sourceData = this.source;
                    res = await selectionOrder.update(channel, byFields);
                } else res = await new SelectionOrder(channel, this.source).saveWithID();

                if(checkToUpdateCache) await this.checkToUpdateCache(res, beforeUpdate);

                return res;
            },
            { concurrency: 1 }
        );
    }

    public async delete(selection_id: number): Promise<void> {
        await map(SelectionOrder.find({ selection_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }

    private async checkToUpdateCache(objectAfterUpdate: ISelectionOrder, objectBeforeUpdate?: ISelectionOrder): Promise<void> {
        if (
            isUndefined(objectBeforeUpdate) ||
            (objectAfterUpdate.row_index !== objectBeforeUpdate.row_index || objectAfterUpdate.column_index !== objectBeforeUpdate.column_index)
        ) {
            await this.sendToCache(objectAfterUpdate);
        }
    }

    private async sendToCache(selectionOrder: ISelectionOrder): Promise<void> {
        const [selection] = await SelectionFilter.listBase({ id: selectionOrder.selection_id });
        if (!isUndefined(selection))
            broker.publishMessageWithCode(
                CommunicationCodes.UPDATE_MARKET_SELECTION_ORDERS,
                {
                    data: selectionOrder,
                    market_id: selection.market_id
                },
                QueueType.CACHE_SERVICE
            );
    }

    public async getForAllSelections(): Promise<ISelectionOrder[]> {
        return SelectionOrderFilter.getAll();
    }
}
