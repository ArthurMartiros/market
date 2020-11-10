import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from '../../../../../CommonJS/src/domain/constant';
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { IMarketTranslation } from '../interfaces/market_name.interface';
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';

export class MarketTranslation extends BaseModelWithLogger implements IMarketTranslation {
    public static tableName = "market_translation";
    public id?: number;
    public market_id: number;
    public website_id: number;
    public channel_id: ChannelType;
    public lang_id: number;
    public name: string;
    public alt_name_1?: string;
    public alt_name_2?: string;

    constructor(data: IMarketTranslation, source?: IUser) {
        super(source);
        this.id = data.id;
        this.market_id = data.market_id;
        this.modelId = this.market_id;
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
        this.alt_name_2 = data.alt_name_2;
    }
}