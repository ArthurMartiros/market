import { MarketCMSFilter } from '../filters/market_cms.filter';
import { each, map } from 'bluebird';
import { ServiceWithRequestInfo } from '../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info';
import { MarketFilter } from '../../markets/filters/market_admin.filter';
import { isUndefined } from 'util';
import { ErrorCodes, ErrorUtil } from '../../../../../CommonJS/src/messaging/ErrorCodes';
import { isNotNumber } from '../../../../../CommonJS/src/utils/validators';
import { IMarketCMSTranslation } from '../interfaces/market_cms.interface';
import { MarketCMSTranslation } from '../models/market_cms.model';

export class MarketCMSService extends ServiceWithRequestInfo {
    public async getAll(market_id: number): Promise<IMarketCMSTranslation[]> {
        if (isNotNumber(market_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const market = await MarketFilter.find({id: market_id});
        if (isUndefined(market)) throw ErrorUtil.newError(ErrorCodes.MARKET_NOT_FOUND);

        return MarketCMSFilter.findAll(Object.assign({ market_id }, this.requestInfo));
    }

    public async updateMany(data: IMarketCMSTranslation[], market_id: number) {
        return map(data, async cms => {
            cms.market_id = market_id;
            cms.lang_id = this.requestInfo.lang_id;
            cms.website_id = this.requestInfo.website_id;

            const filterFields = {
                market_id: cms.market_id,
                website_id: cms.website_id,
                channel_id: cms.channel_id,
                lang_id: cms.lang_id
            };

            const presentCMS = await MarketCMSTranslation.findOne(filterFields);
            if (presentCMS) {
                presentCMS.sourceData = this.source;
                return presentCMS.update(cms, filterFields);
            }
            else return new MarketCMSTranslation(cms, this.source).save();
        });
    }

    public async delete(market_id: number): Promise<void> {
        await MarketCMSTranslation.delete({ market_id });
        await each(MarketCMSTranslation.find({ market_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }
}