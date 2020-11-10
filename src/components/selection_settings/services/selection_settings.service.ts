import { ISelectionSettings } from '../interfaces/selection_settings.interface';
import { SelectionSettings } from '../models/selection_settings.model';
import { SelectionSettingsFilter } from '../filters/selection_settings.filter';
import { ErrorCodes, ErrorUtil } from '../../../../../CommonJS/src/messaging/ErrorCodes';
import { SelectionFilter } from '../../selections/filters/selection.filter';
import { ServiceWithRequestInfo } from '../../../../../CommonJS/src/components/service_with_request_info/service_with_request_info';
import { isNotNumber } from '../../../../../CommonJS/src/utils/validators';
import { TradingMode } from '../../../../../CommonJS/src/enums/trading_mode.enum';
import { isUndefined } from 'util';
import { map } from 'bluebird';

export class SelectionSettingsService extends ServiceWithRequestInfo {
    public async getAll(selection_id: number): Promise<ISelectionSettings[]> {
        if (isNotNumber(selection_id)) throw ErrorUtil.newError(ErrorCodes.BAD_REQUEST);
        const [selection] = await SelectionFilter.listBase({id: selection_id});
        if (isUndefined(selection)) throw ErrorUtil.newError(ErrorCodes.SELECTION_DOES_NOT_EXISTS);
        return SelectionSettingsFilter.findAll(selection_id);
    }

    public async updateMany(selection_id: number, data: ISelectionSettings[]): Promise<ISelectionSettings[]> {
        switch (data.length) {
            case 1:
                if (data[0].trading_mode === TradingMode.LIVE) await SelectionSettings.delete({
                    selection_id,
                    trading_mode: TradingMode.PREMATCH
                });
                else {
                    if (data[0].trading_mode === TradingMode.PREMATCH) await SelectionSettings.delete({
                        selection_id,
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

        return map(data, async settings => {
            settings.selection_id = selection_id;
            const byFields = {
                selection_id,
                trading_mode: settings.trading_mode
            };
            const presentSettings = await SelectionSettings.findOne(byFields);
            if (!isUndefined(presentSettings)) {
                presentSettings.sourceData = this.source;
                return presentSettings.update(settings, byFields);
            } else {
                return new SelectionSettings(settings, this.source).saveWithID();
            }
        });
    }

    public async delete(selection_id: number): Promise<void> {
        await map(SelectionSettings.find({selection_id}), async item => {
            item.sourceData = this.source;
            return item.delete();
        });
    }
}