import {ConversationQueueType, MqttSensorQueue, QueueCallback, QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {IBehaviour} from "../api";
import {IEventPayload} from "../api/IEvent";
import {ConversationHeaderBuilder} from "./header/ConversationHeaderBuilder";

export class Subscription {
    public type: ConversationQueueType;
    public header: QueueHeader;
    public callback: QueueCallback;
    public mqttSensorQueue: MqttSensorQueue;
    public conversationHeader: Map<string, string> = new Map();
    public behaviourBind: Array<IBehaviour> = [];

    constructor(type: ConversationQueueType, header: QueueHeader, callback: QueueCallback, mqttSensorQueue: MqttSensorQueue) {
        this.type = type;
        this.header = header;
        this.callback = callback;
        this.mqttSensorQueue = mqttSensorQueue;

        this.mqttSensorQueue.subscribe(type, header, callback);
    }

    /**
     * Unsubscribes from the queue
     */
    public unsubscribe() {
        this.behaviourBind.forEach(binding => binding.unbind());
        this.mqttSensorQueue.unsubscribe(this.getTopic());
    }

    /**
     * Sends the given message
     *
     * @param payload the payload
     */
    public publish = (payload: IEventPayload) => {
        const conversationHeader = ConversationHeaderBuilder.build(this.header, this.conversationHeader, payload);
        this.mqttSensorQueue.publish(this.type, conversationHeader, payload.payload, payload.attributes, payload.type);
    }

    /**
     * Binds the given IBehaviour to the Subscription.
     *
     * @param behaviour
     */
    public bind(behaviour: IBehaviour) {
        behaviour.init(this.header.channelId);
        behaviour.bind(this);
        this.behaviourBind.push(behaviour);
    }

    public onMessage(conversationHeader: Map<string, string>, message: object) {
        this.conversationHeader = new Map(Array.from(conversationHeader.entries()));
        this.mqttSensorQueue.callback(this.getTopic(), message);
    }

    public getTopic = () => this.mqttSensorQueue.getTopic(this.type, this.header);

}
