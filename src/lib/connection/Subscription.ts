import {ConversationQueueType, MqttSensorQueue, QueueCallback, QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {KeyboardBehaviour} from "../behaviour/KeyboardBehaviour";
import {MouseBehaviour} from "../behaviour/MouseBehaviour";
import {IBehaviour, IRenderer, ISpecification} from "../api";
import EventStream from "../event/EventStream";
import {EventType} from "../event/EventType";
import {IEventPayload} from "../api/IEvent";
import {MultiTargetRenderer} from "../renderer/MultiTargetRenderer";

export class Subscription {
    public type: ConversationQueueType;
    public header: QueueHeader;
    public callback: QueueCallback;
    public mqttSensorQueue: MqttSensorQueue;
    public renderer: IRenderer;
    private readonly behaviourBind: Array<IBehaviour> = [];

    constructor(type: ConversationQueueType, header: QueueHeader, callback: QueueCallback, mqttSensorQueue: MqttSensorQueue, renderer: IRenderer) {
        this.type = type;
        this.header = header;
        this.callback = callback;
        this.renderer = renderer;
        this.mqttSensorQueue = mqttSensorQueue;

        this.mqttSensorQueue.subscribe(type, header, callback);
        if (this.type === ConversationQueueType.INTERACTION) {
            const ev = EventType.withChannelId(EventType.PUBLISH, this.header.channelId);
            EventStream.addListener(ev, (e:IEventPayload) => this.publish(e[0]));
        }
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
    public publish = (payload: IEventPayload) =>
        this.mqttSensorQueue.publish(this.type, this.header, payload.payload, payload.attributes, payload.type)

    /**
     * Initial request to make the system aware that the user is listening.
     */
    public reception(attributes: object) {
        if (this.behaviourBind.length === 0) {
            this.bind(new KeyboardBehaviour(this.renderer));
            this.bind(new MouseBehaviour(this.renderer));
        }
        this.mqttSensorQueue.publishConvInteraction(this.header, attributes);
    }

    public onMessage(message: object) {
        if (this.type === ConversationQueueType.INTERACTION) {
            let spec = message as ISpecification;
            if (spec.type !== "reception" && spec.elements) {
                spec = Object.assign(spec, {position: 'left', channelId: this.header.channelId});
                this.renderer.render(spec).forEach(element => {
                    this.renderer instanceof MultiTargetRenderer ?
                        this.renderer.appendContent(element, this.header.channelId) :
                        this.renderer.appendContent(element);
                });
            }
        }
        this.mqttSensorQueue.callback(this.getTopic(), message);
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

    private getTopic = () => this.mqttSensorQueue.getTopic(this.type, this.header);

}
