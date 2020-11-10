import { CommunicationCodes } from "../../../CommonJS/src/messaging/CommunicationCodes";
import { MessageHandlerBase } from "../../../CommonJS/src/messaging/MessageHandlerBase";
import { MarketService } from "../components/markets/services/market.service";
import { SelectionService } from "../components/selections/services/selection.service";
import { CombinationGroupService } from "../components/combination_groups/services/combination_group.service";
import { LadderService } from "../components/ladder/services/ladder.service";
import { IMessage } from "../../../CommonJS/src/messaging/message.interface";
import { DisplayTypeService } from "../components/display_type/services/display_type.service";
import { MarketNameService } from "../components/market_name/services/market_name.service";
import { MarketOrderService } from "../components/market_order/services/market_order.service";
import { MarketSettingsService } from "../components/market_settings/services/market_settings.service";
import { MarketCMSService } from "../components/market_cms/services/market_cms.service";
import { MarketDynamicLimitService } from "../components/market_dynamic_limit/services/market_dynamic_limit.service";
import { SelectionNameService } from "../components/selection_name/services/selection_name.service";
import { SelectionOrderService } from "../components/selection_order/services/selection_order.service";
import { SelectionSettingsService } from "../components/selection_settings/services/selection_settings.service";

const marketService = new MarketService();
const selectionService = new SelectionService();
const combinationGroupService = new CombinationGroupService();
const ladderService = new LadderService();
const displayTypeService = new DisplayTypeService();
const nameService = new MarketNameService();
const orderService = new MarketOrderService();
const settingsService = new MarketSettingsService();
const cmsService = new MarketCMSService();
const dynamicLimitService = new MarketDynamicLimitService();
const selectionNameService = new SelectionNameService();
const selectionOrderService = new SelectionOrderService();
const selectionSettingsService = new SelectionSettingsService();


export class MessageHandler extends MessageHandlerBase {
    protected async handleMessage(message: IMessage): Promise<{} | void> {
        // set request info to all market services
        marketService.setRequestInfo(message);
        nameService.setRequestInfo(message);
        cmsService.setRequestInfo(message);
        orderService.setRequestInfo(message);
		settingsService.setRequestInfo(message);
        dynamicLimitService.setRequestInfo(message);
        // set request info to all selection services
        selectionService.setRequestInfo(message);
        selectionNameService.setRequestInfo(message);
        selectionOrderService.setRequestInfo(message);

        const body = message.body;

        switch (message.code) {
            case CommunicationCodes.GET_MARKET:
                return marketService.get(body);
            case CommunicationCodes.GET_MARKETS:
                return marketService.list(body);
            case CommunicationCodes.ADD_MARKET:
                return marketService.add(body);
            case CommunicationCodes.UPDATE_MARKET:
                return marketService.update(body);
            case CommunicationCodes.DELETE_MARKET:
                return marketService.delete(body, body.adminSuccess);
            case CommunicationCodes.CLONE_MARKETS:
                return marketService.clone(message.body);
            // combination groups
            case CommunicationCodes.ADD_COMBINATION_GROUP:
                return combinationGroupService.add(body);
            case CommunicationCodes.GET_COMBINATION_GROUP:
                return combinationGroupService.get(body);
            case CommunicationCodes.UPDATE_COMBINATION_GROUP:
                return combinationGroupService.update(body);
            case CommunicationCodes.DELETE_COMBINATION_GROUP:
                return combinationGroupService.delete(body);
            case CommunicationCodes.GET_COMBINATION_GROUPS:
                return combinationGroupService.list(body);
            case CommunicationCodes.UPDATE_COMBINATION_GROUPS:
                return combinationGroupService.updateMany(body);
            // ladder
            case CommunicationCodes.ADD_LADDER:
                return ladderService.add(body);
            case CommunicationCodes.GET_LADDER:
                return ladderService.get(body);
            case CommunicationCodes.UPDATE_LADDER:
                return ladderService.update(body);
            case CommunicationCodes.GET_FILTERED_LADDERS:
                return ladderService.getFilteredLadders(body);
            case CommunicationCodes.UPDATE_LADDERS:
                return ladderService.updateMany(body);
            case CommunicationCodes.LIST_LADDER:
                return ladderService.list(body);
            case CommunicationCodes.DELETE_LADDER:
                return ladderService.delete(body);
            // display_type
            case CommunicationCodes.GET_MARKET_DISPLAY_TYPE:
                return displayTypeService.get(body);
            case CommunicationCodes.GET_MARKET_DISPLAY_TYPES:
                return displayTypeService.list(body);
            case CommunicationCodes.ADD_MARKET_DISPLAY_TYPE:
                return displayTypeService.add(body);
            case CommunicationCodes.EDIT_MARKET_DISPLAY_TYPE:
                return displayTypeService.update(body);
            case CommunicationCodes.EDIT_MARKET_DISPLAY_TYPES:
                return displayTypeService.updateMany(body);
            case CommunicationCodes.DELETE_MARKET_DISPLAY_TYPE:
                return displayTypeService.delete(body);
            // Market Restriction
            case CommunicationCodes.GET_MARKET_RESTRICTIONS:
                return marketService.getMarketRestrictions(body.id);
            case CommunicationCodes.ADD_MARKET_RESTRICTION:
                return marketService.addMarketRestrictions(body.id, body.restricted_id);
            case CommunicationCodes.EDIT_MARKET_RESTRICTIONS:
                return marketService.updateMarketRestrictions(body.id, body.data);
            case CommunicationCodes.DELETE_MARKET_RESTRICTIONS:
                return marketService.deleteMarketRestrictions(body.id);
            case CommunicationCodes.DELETE_MARKET_RESTRICTION:
                return marketService.deleteMarketRestriction(body.id, body.restricted_id);
            // update market code
            case CommunicationCodes.UPDATE_MARKET_CODE:
                return marketService.updateCode(body);
            // market name
            case CommunicationCodes.GET_MARKET_NAMES:
                return nameService.getAll(body);
            case CommunicationCodes.GET_MARKETS_NAMES:
                return nameService.getAllTranslations();
            case CommunicationCodes.UPDATE_MARKET_NAMES:
                return nameService.updateMany(body.data, body.market_id);
            // market order
            case CommunicationCodes.GET_MARKET_ORDERS:
                return orderService.getAll(body);
            case CommunicationCodes.GET_MARKETS_ORDERS:
                return orderService.getForAllMarkets();
            case CommunicationCodes.UPDATE_MARKET_ORDERS:
                return orderService.updateMany(body.data, body.market_id);
            // market settings
            case CommunicationCodes.GET_MARKET_SETTINGS:
                return settingsService.getAll(body);
            case CommunicationCodes.UPDATE_MARKET_SETTINGS:
                return settingsService.updateMany(body.market_id, body.data);
            case CommunicationCodes.ADD_MARKET_SETTINGS:
                return settingsService.add(body.data, body.category_id);
            // market cms
            case CommunicationCodes.GET_MARKET_CMS:
                return cmsService.getAll(body.market_id);
            case CommunicationCodes.UPDATE_MARKET_CMS:
                return cmsService.updateMany(body.data, body.market_id);
            // market dynamic limit
            case CommunicationCodes.GET_MARKET_DYNAMIC_LIMITS:
                return dynamicLimitService.getAll(body);
            case CommunicationCodes.UPDATE_MARKET_DYNAMIC_LIMITS:
                return dynamicLimitService.updateMany(body.data, body.market_id);
            //  selections
            // case CommunicationCodes.GET_MARKET_SELECTIONS:
            //     return selectionService.getMarketSelections(body);
            // case CommunicationCodes.ADD_MARKET_SELECTIONS:
            //     return selectionService.updateMarketSelections(body.id, body.selections);
            case CommunicationCodes.GET_MARKET_SELECTION:
                return selectionService.get(body);
            case CommunicationCodes.GET_MARKET_SELECTIONS:
                return selectionService.list(body);
            case CommunicationCodes.ADD_MARKET_SELECTION:
                return selectionService.add(body.market_id, body.data);
            case CommunicationCodes.UPDATE_MARKET_SELECTION:
                return selectionService.update(body.id, body.data);
            case CommunicationCodes.DELETE_MARKET_SELECTION:
                return selectionService.delete(body.id, true, body.adminSuccess);
            case CommunicationCodes.ADD_RULES:
                return selectionService.updateRule(body);
            case CommunicationCodes.GET_RULES:
                return selectionService.getRules(body);
            // selection name
            case CommunicationCodes.GET_MARKET_SELECTION_NAMES:
                return selectionNameService.getAll(body.selection_id);
            case CommunicationCodes.GET_MARKET_SELECTIONS_NAMES:
                return selectionNameService.getForAllSelections();
            case CommunicationCodes.UPDATE_MARKET_SELECTION_NAMES:
                return selectionNameService.updateMany(body.selection_id, body.data);
            // selection order
            case CommunicationCodes.GET_MARKET_SELECTION_ORDERS:
                return selectionOrderService.getAll(body.selection_id);
            case CommunicationCodes.GET_MARKET_SELECTIONS_ORDERS:
                return selectionOrderService.getForAllSelections();
            case CommunicationCodes.UPDATE_MARKET_SELECTION_ORDERS:
                return selectionOrderService.updateMany(body.selection_id, body.data);
            // // selection settings
            case CommunicationCodes.GET_MARKET_SELECTION_SETTINGS:
                return selectionSettingsService.getAll(body.selection_id);
            case CommunicationCodes.UPDATE_MARKET_SELECTION_SETTINGS:
                return selectionSettingsService.updateMany(body.selection_id, body.data);
        }
    }
}