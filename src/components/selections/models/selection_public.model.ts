import { ISelectionPublic } from '../interfaces/selection.interface';
import { Selection } from './selection.model';
import { ChannelType } from '../../../../../CommonJS/src/enums/channel_type.enum';
import { DEFAULT_LANGUAGE, DEFAULT_WEB_SITE } from '../../../../../CommonJS/src/domain/constant';

export class SelectionPublic extends Selection implements ISelectionPublic {
    public id: number;
    public website_id: number;
    public channel_id: ChannelType;
    public lang_id: number;
    public column_index: number;
    public row_index: number;
    public name: string;
    public alt_name?: string;

    constructor(data: ISelectionPublic) {
        super(data);
        this.website_id = data.website_id || DEFAULT_WEB_SITE;
        this.channel_id = data.channel_id || ChannelType.BACKEND;
        this.lang_id = data.lang_id || DEFAULT_LANGUAGE;
        this.column_index = data.column_index;
        this.row_index = data.row_index;
        this.name = data.name;
        this.alt_name = data.alt_name;
    }
}