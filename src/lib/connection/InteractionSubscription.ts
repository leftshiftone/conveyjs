import {Subscription} from "./Subscription";
import {ConversationQueueType, MqttSensorQueue, QueueCallback, QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {IRenderer, ISpecification} from "../api";
import {EventType} from "../event/EventType";
import EventStream from "../event/EventStream";
import {IEventPayload} from "../api/IEvent";
import {KeyboardBehaviour} from "../behaviour/KeyboardBehaviour";
import {MouseBehaviour} from "../behaviour/MouseBehaviour";
import {MessageType} from "../support/MessageType";

export class InteractionSubscription extends Subscription {

    public renderer: IRenderer;

    constructor(header: QueueHeader, callback: QueueCallback, mqttSensorQueue: MqttSensorQueue, renderer: IRenderer) {
        super(ConversationQueueType.INTERACTION, header, callback, mqttSensorQueue);
        this.renderer = renderer;
        this.renderer.init(header.channelId);
        const ev = EventType.withChannelId(EventType.PUBLISH, this.header.channelId);
        EventStream.addListener(ev, (e:IEventPayload) => this.publish(e[0]));
    }

    /**
     * Initial request to make the system aware that the user is listening.
     */
    public reception(attributes: object) {
        if (this.behaviourBind.length === 0) {
            this.bind(new KeyboardBehaviour(this.renderer));
            this.bind(new MouseBehaviour(this.renderer));
        }
        this.mqttSensorQueue.publishConvInteraction(this.header, {attributes, payload: {}, type: MessageType.RECEPTION});
    }

    public onMessage(message: object) {
        let spec = message as ISpecification;
        if (spec.type !== "reception" && spec.elements) {
            spec = Object.assign(spec, {position: 'left', channelId: this.header.channelId});
            this.renderer.render(spec).forEach(element => {
                this.renderer.appendContent(element);
            });
        }
        super.onMessage(message);
    }

}
