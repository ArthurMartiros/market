/**
 * Created by Georgi on 3/2/2017.
 */

import * as uuid from "uuid";
import { BaseModel, broker } from "../../CommonJS/src/base/base.model";
import { MessageHandler } from "./messaging/MessageHandler";
import { QueueType } from "../../CommonJS/src/messaging/QueueType";
import { CONFIG } from "../../CommonJS/src/utils/utils";

class Server {
    constructor() {
        this.initBroker();
        this.initDB();
    }

    private async initBroker() {
        await broker.init();
        let queueName = QueueType.MARKET_SERVICE;

        // setup queue for being able to reply to exactly this service requests
        let callbackQueue = queueName + "-" + uuid.v4();
        broker.declareQueue(callbackQueue, { autoDelete: true });
        broker.callbackQueue = callbackQueue;
        new MessageHandler(broker, callbackQueue, false);

        // get messages from message broker
        new MessageHandler(broker, queueName);
    }

    private initDB() {
        BaseModel.db_config = CONFIG().Databases.Market.postgres;
    }
}

new Server();
