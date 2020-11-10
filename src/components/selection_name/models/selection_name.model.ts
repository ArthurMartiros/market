import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from '../../../../../CommonJS/src/domain/constant';
import { ChannelType } from "../../../../../CommonJS/src/enums/channel_type.enum";
import { ISelectionTranslation } from '../interfaces/selection_name.interface';
import { toNumber } from "lodash";
import { BaseModelWithLogger } from '../../../../../CommonJS/src/base/baseWithLoger.model';
import { IUser } from '../../../../../CoreService/src/components/users/interfaces/user.interface';

export class SelectionTranslation extends BaseModelWithLogger implements ISelectionTranslation {
    public static tableName = "selection_translation";
    public id?: number;
    public selection_id: number;
    public website_id: number;
    public channel_id: ChannelType;
    public lang_id: number;
    public name: string;
    public alt_name_1?: string;

    constructor(data: ISelectionTranslation, source?: IUser) {
        super(source);
        this.id = data.id;
        this.selection_id = toNumber(data.selection_id);
        this.modelId = this.selection_id;
        this.website_id = toNumber(data.website_id) || DEFAULT_WEB_SITE;
        this.channel_id = toNumber(data.channel_id) || ChannelType.BACKEND;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.name = data.name;
        this.alt_name_1 = data.alt_name_1;
    }
}