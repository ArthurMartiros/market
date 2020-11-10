import { ErrorCodes, ErrorUtil } from "../../../../../CommonJS/src/messaging/ErrorCodes";
import { isNotNumber } from "../../../../../CommonJS/src/utils/validators";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";
import { ServiceWithRequestInfo } from "../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info";
import { IMarketSettings } from "../interfaces/market_settings.interface";
import { MarketSettings } from "../models/market_settings.model";
import { isUndefined } from "util";
import { map } from "bluebird";
import { QueryBuilder, BaseModel, RawParam } from "../../../../../CommonJS/src/base/base.model";
import { Market } from "../../markets/models/market.model";
import { MarketTranslation } from "../../market_name/models/market_name.model";
import { DEFAULT_WEB_SITE, DEFAULT_LANGUAGE } from "../../../../../CommonJS/src/domain/constant";
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { toNumber } from "lodash";
export class MarketSettingsService extends ServiceWithRequestInfo {
    public async add(data: IMarketSettings[], category_id: number): Promise<IMarketSettings[]> {
        if (!data || isNotNumber(category_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        return map(data, async d => {
            d.category_id = category_id;
            return d.id ? await new MarketSettings(d, this.source).update() : await new MarketSettings(d, this.source).saveWithID();
        });
    }

    public async getAll(data: Partial<IMarketSettings>): Promise<IMarketSettings[]> {
        return data.market_id ? MarketSettings.findMany({ market_id: data.market_id }) : this.getMarketCategorySettings(data);
    }

    private getMarketCategorySettings(data: Partial<IMarketSettings>) {
        if (isNotNumber(data.sport_id) || isNotNumber(data.category_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        data.sport_id = toNumber(data.sport_id);
        data.category_id = toNumber(data.category_id);
        const query = QueryBuilder(Market.tableName)
            .select([`${MarketSettings.tableName}.*`, `${Market.tableName}.id as market_id`, `${MarketTranslation.tableName}.name as market_name`])
            .leftJoin(`${MarketSettings.tableName}`, function() {
                this.on(`${Market.tableName}.id`, `${MarketSettings.tableName}.market_id`);
                this.andOn(`${MarketSettings.tableName}.category_id`, RawParam(data.category_id as number));
            })
            .leftJoin(`${MarketTranslation.tableName}`, `${Market.tableName}.id`, `${MarketTranslation.tableName}.market_id`)
            .where(`${MarketTranslation.tableName}.website_id`, DEFAULT_WEB_SITE)
            .where(`${MarketTranslation.tableName}.channel_id`, ChannelType.BACKEND)
            .where(`${MarketTranslation.tableName}.lang_id`, DEFAULT_LANGUAGE)
            .where(`${Market.tableName}.category_id`, data.sport_id);
        return BaseModel.manyOrNoneRaw(query.toString());
    }

    public async updateMany(market_id: number, data: IMarketSettings[]): Promise<IMarketSettings[]> {
        switch (data.length) {
            case 1:
                if (data[0].trading_mode === TradingMode.LIVE)
                    await MarketSettings.delete({
                        market_id,
                        trading_mode: TradingMode.PREMATCH
                    });
                else {
                    if (data[0].trading_mode === TradingMode.PREMATCH)
                        await MarketSettings.delete({
                            market_id,
                            trading_mode: TradingMode.LIVE
                        });
                    else throw ErrorUtil.newError(ErrorCodes.INVALID_SETTINGS);
                }
                break;
            case 2:
                break;
            default:
                throw ErrorUtil.newError(ErrorCodes.INVALID_SETTINGS);
        }

        return map(data, async marketSettings => {
            marketSettings.market_id = market_id;
            const byFields = {
                market_id,
                trading_mode: marketSettings.trading_mode
            };
            const presentSettings = await MarketSettings.findOne(byFields);
            if (!isUndefined(presentSettings)) {
                presentSettings.sourceData = this.source;
                return presentSettings.update(marketSettings, byFields);
            } else {
                return new MarketSettings(marketSettings, this.source).saveWithID();
            }
        });
    }

    public async delete(market_id: number): Promise<void> {
        await map(MarketSettings.find({ market_id }), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }
}
