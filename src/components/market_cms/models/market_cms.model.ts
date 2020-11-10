import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from '../../../../../CommonJS/src/domain/constant';
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { IMarketCMSTranslation } from '../interfaces/market_cms.interface';
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';

export class MarketCMSTranslation extends BaseModelWithLogger implements IMarketCMSTranslation {
    public static tableName = "market_cms_translation";
    public market_id: number;
    public website_id: number;
    public channel_id: ChannelType;
    public lang_id: number;
    public description_1?: string;
    public description_2?: string;

    constructor(data: IMarketCMSTranslation, source?: IUser) {
        super(source);
        this.market_id = data.market_id;
        this.modelId = this.market_id;
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.description_1 = data.description_1;
        this.description_2 = data.description_2;
    }
}