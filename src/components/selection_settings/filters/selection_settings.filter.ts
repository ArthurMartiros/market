import { QueryBuilder } from "../../../../../CommonJS/src/base/base.model";
import { SelectionSettings } from "../models/selection_settings.model";
import { ISelectionSettings } from "../interfaces/selection_settings.interface";
import { TradingMode } from "../../../../../CommonJS/src/enums/trading_mode.enum";

export class SelectionSettingsFilter extends SelectionSettings {
    public static findAll(selection_id: number): Promise<ISelectionSettings[]> {
        const query = QueryBuilder(SelectionSettings.tableName).where(`${SelectionSettings.tableName}.selection_id`, selection_id);
        return SelectionSettings.manyOrNone(query);
    }

    public static findWithTradingMode(selection_id: number, trading_mode: TradingMode): Promise<ISelectionSettings[]> {
        const query = QueryBuilder(SelectionSettings.tableName)
            .where(`${SelectionSettings.tableName}.selection_id`, selection_id)
            .where(`${SelectionSettings.tableName}.trading_mode`, trading_mode);
        return SelectionSettings.manyOrNone(query);
    }
}
