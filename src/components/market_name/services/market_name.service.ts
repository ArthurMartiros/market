import { MarketNameFilter } from "../filters/market_name.filter";
import { map } from "bluebird";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { ErrorUtil, ErrorCodes } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { MarketFilter } from "../../markets/filters/market_admin.filter";
import { isString, isUndefined } from "util";
import { IMarketTranslation } from "../interfaces/market_name.interface";
import { MarketTranslation } from "../models/market_name.model";
import { broker } from "../../../../../CommonJS/src/base/base.model";
import { QueueType } from "../../../../../CommonJS/src/messaging/QueueType";
import { CommunicationCodes } from "../../../../../CommonJS/src/messaging/CommunicationCodes";
import { cloneDeep, toNumber } from "lodash";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from "../../../../../CommonJS/src/domain/constant";

export class MarketNameService extends ServiceWithRequestInfo {
    public async getAll(data: Partial<IMarketTranslation>): Promise<IMarketTranslation[]> {
        if (isNotNumber(data.market_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market = await MarketFilter.find({ id: data.market_id });
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);
        return MarketNameFilter.findAll(Object.assign({ market_id: data.market_id }, this.requestInfo));
    }

    public async updateMany(data: IMarketTranslation[], market_id: number, website_id?: number, lang_id?: number, checkToUpdateCache: boolean = true) {
        return map(data, async marketName => {
            marketName.market_id = market_id;
            marketName.website_id = website_id || this.requestInfo.website_id;
            marketName.lang_id = lang_id || this.requestInfo.lang_id;
            const filterFields = {
                market_id: marketName.market_id,
                website_id: marketName.website_id,
                channel_id: marketName.channel_id,
                lang_id: marketName.lang_id
            };
            const names = await MarketTranslation.findOne(filterFields);
            const beforeUpdate = cloneDeep(names);
            let res: IMarketTranslation;

            if (names) {
                names.sourceData = this.source;
                res = await names.update(marketName, filterFields);
            } else res = await new MarketTranslation(marketName, this.source).saveWithID();

            if(checkToUpdateCache) this.checkToUpdateCache(res, beforeUpdate);

            return res;
        });
    }

    public async delete(market_id: number) {
        await map(MarketTranslation.find({ market_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }

    private async checkToUpdateCache(objectAfterUpdate: IMarketTranslation, objectBeforeUpdate?: IMarketTranslation): Promise<void> {
        if (
            isUndefined(objectBeforeUpdate) &&
            toNumber(objectAfterUpdate.website_id) === DEFAULT_WEB_SITE &&
            toNumber(objectAfterUpdate.channel_id) === ChannelType.BACKEND &&
            toNumber(objectAfterUpdate.lang_id) === DEFAULT_LANGUAGE
        )
            return;
        if (
            isUndefined(objectBeforeUpdate) ||
            (objectAfterUpdate.name !== objectBeforeUpdate.name ||
                objectAfterUpdate.alt_name_1 !== objectBeforeUpdate.alt_name_1 ||
                objectAfterUpdate.alt_name_2 !== objectBeforeUpdate.alt_name_2)
        ) {
            if (toNumber(objectAfterUpdate.channel_id) !== ChannelType.BACKEND) {
                if (
                    (isString(objectAfterUpdate.name) && objectAfterUpdate.name.length === 0) ||
                    (isString(objectAfterUpdate.alt_name_1) && objectAfterUpdate.alt_name_1.length === 0) ||
                    (isString(objectAfterUpdate.alt_name_2) && objectAfterUpdate.alt_name_2.length === 0)
                ) {
                    const defNames = await MarketTranslation.findOne({
                        market_id: objectAfterUpdate.market_id,
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
                        if (isString(objectAfterUpdate.alt_name_2) && objectAfterUpdate.alt_name_2.length === 0) {
                            objectAfterUpdate.alt_name_2 = defNames.alt_name_2;
                        }
                    }
                }
            }
            this.sendToCache(objectAfterUpdate);
        }
    }

    private sendToCache(market: IMarketTranslation): void {
        broker.publishMessageWithCode(CommunicationCodes.UPDATE_MARKET_NAMES, market, QueueType.CACHE_SERVICE);
    }

    public async getAllTranslations(): Promise<IMarketTranslation[]> {
        return MarketNameFilter.getAll();
    }
}
