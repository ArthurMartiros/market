import { ISelectionTranslation } from "../interfaces/selection_name.interface";
import { SelectionNameFilter } from "../filters/selection_name.filter";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { map } from "bluebird";
import { SelectionFilter } from "../../selections/filters/selection.filter";
import { isString, isUndefined } from "util";
import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { SelectionTranslation } from "../models/selection_name.model";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { broker } from "../../../../../CommonJS/src/base/base.model";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { toNumber, cloneDeep } from "lodash";

export class SelectionNameService extends ServiceWithRequestInfo {
    public async getAll(selection_id: number): Promise<ISelectionTranslation[]> {
        if (isNotNumber(selection_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const [selection] = await SelectionFilter.listBase({ id: selection_id });
        if (isUndefined(selection)) throw ErrorUtil.newError(ErrorCodes.SELECTION_DOES_NOT_EXISTS);
        return SelectionNameFilter.findAll(Object.assign(this.requestInfo, { selection_id }));
    }

    public async updateMany(selection_id: number, data: ISelectionTranslation[], website_id?: number, lang_id?: number, checkToUpdateCache: boolean = true): Promise<ISelectionTranslation[]> {
        return map(
            data,
            async name => {
                name.selection_id = selection_id;
                name.website_id = website_id || this.requestInfo.website_id;
                name.lang_id = lang_id || this.requestInfo.lang_id;

                const filterFields = {
                    selection_id: name.selection_id,
                    website_id: name.website_id,
                    channel_id: name.channel_id,
                    lang_id: name.lang_id
                };
                const names = await SelectionTranslation.findOne(filterFields);
                const beforeUpdate = cloneDeep(names);
                let res: ISelectionTranslation;

                if (names) {
                    names.sourceData = this.source;
                    res = await names.update(name, filterFields);
                } else res = await new SelectionTranslation(name, this.source).saveWithID();

                if(checkToUpdateCache) await this.checkToUpdateCache(res, beforeUpdate);
                return res;
            },
            { concurrency: 1 }
        );
    }

    public async delete(selection_id: number) {
        await map(SelectionTranslation.find({ selection_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }

    private async checkToUpdateCache(objectAfterUpdate: ISelectionTranslation, objectBeforeUpdate?: ISelectionTranslation): Promise<void> {
        if (isUndefined(objectBeforeUpdate) || (objectAfterUpdate.name !== objectBeforeUpdate.name || objectAfterUpdate.alt_name_1 !== objectBeforeUpdate.alt_name_1)) {
            if (toNumber(objectAfterUpdate.channel_id) !== ChannelType.BACKEND) {
                if (
                    (isString(objectAfterUpdate.name) && objectAfterUpdate.name.length === 0) ||
                    (isString(objectAfterUpdate.alt_name_1) && objectAfterUpdate.alt_name_1.length === 0)
                ) {
                    const defNames = await SelectionTranslation.findOne({
                        selection_id: objectAfterUpdate.selection_id,
                        website_id: objectAfterUpdate.website_id,
                        channel_id: ChannelType.BACKEND,
                        lang_id: objectAfterUpdate.lang_id
                    });
                    if (!isUndefined(defNames)) {
                        if (isString(objectAfterUpdate.name) && objectAfterUpdate.name.length === 0) {
                            objectAfterUpdate.name = defNames.name;
                        }
                        if (isString(objectAfterUpdate.alt_name_1) && objectAfterUpdate.alt_name_1.length === 0) {
                            objectAfterUpdate.alt_name_1 = defNames.alt_name_1;
                        }
                    }
                }
            }
            this.sendToCache(objectAfterUpdate);
        }
    }

    private async sendToCache(selectionTranslation: ISelectionTranslation): Promise<void> {
        const [selection] = await SelectionFilter.listBase({ id: selectionTranslation.selection_id });
        if (!isUndefined(selection))
            broker.publishMessageWithCode(
                CommunicationCodes.UPDATE_MARKET_SELECTION_NAMES,
                {
                    data: selectionTranslation,
                    market_id: selection.market_id
                },
                QueueType.CACHE_SERVICE
            );
    }

    public async getForAllSelections(): Promise<ISelectionTranslation[]> {
        return SelectionNameFilter.getAll();
    }
}
