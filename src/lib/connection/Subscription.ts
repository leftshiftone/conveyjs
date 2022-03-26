import {ConversationQueueType, MqttSensorQueue, QueueCallback, QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {IBehaviour} from "../api";
import {IEventPayload} from "../api/IEvent";

export class Subscription {
    public type: ConversationQueueType;
    public header: QueueHeader;
    public callback: QueueCallback;
    public mqttSensorQueue: MqttSensorQueue;
    public userProperties: Map<string,string> = new Map();
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
        const headerClone:any = Object.assign({}, this.header);
        let conversationHeader = this.convertMapToObject(this.userProperties)
        const mergedHeader = Object.assign(headerClone, conversationHeader);
        const enrichedHeader = Object.assign(mergedHeader, {
            language: "de",
            type: "utterance"
        });
        this.mqttSensorQueue.publish(this.type, enrichedHeader, payload.payload, payload.attributes, payload.type);
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

    public onMessage(communicationHeader: Map<string,string>, message: object) {
        this.userProperties= new Map(Array.from(communicationHeader.entries()))
        this.mqttSensorQueue.callback(this.getTopic(), message);
    }

    public getTopic = () => this.mqttSensorQueue.getTopic(this.type, this.header);

    private convertMapToObject(map: Map<string,string>) {
        return Array.from(map)
            .filter(([k, v]) => v !== undefined)
            .reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value })
        ), {});
    }
}
