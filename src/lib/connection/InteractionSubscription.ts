import {Subscription} from "./Subscription";
import {ConversationQueueType, MqttSensorQueue, QueueCallback, QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {IRenderer, ISpecification} from "../api";
import {EventType} from "../event/EventType";
import EventStream from "../event/EventStream";
import {IEventPayload} from "../api/IEvent";
import {KeyboardBehaviour} from "../behaviour/KeyboardBehaviour";
import {MouseBehaviour} from "../behaviour/MouseBehaviour";
import {MessageType} from "../support/MessageType";
import {InteractionInterceptor} from "./interceptor/InteractionInterceptor";
import {DefaultInteractionInterceptor} from "./interceptor/DefaultInteractionInterceptor";
import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";
import {ConversationHeaderBuilder} from "./header/ConversationHeaderBuilder";

export class InteractionSubscription extends Subscription {

    public renderer: IRenderer;
    private interactionInterceptor: InteractionInterceptor;

    constructor(header: QueueHeader, callback: QueueCallback, mqttSensorQueue: MqttSensorQueue, renderer: IRenderer, interactionInterceptor: InteractionInterceptor = new DefaultInteractionInterceptor()) {
        super(ConversationQueueType.INTERACTION, header, callback, mqttSensorQueue);
        this.renderer = renderer;
        this.renderer.init(header.channelId);
        this.interactionInterceptor = interactionInterceptor;

        const ev = EventType.withChannelId(EventType.PUBLISH, this.header.channelId);
        EventStream.addListener(ev, (e: IEventPayload) => this.publish((this.interactionInterceptor.execute(new ConvInteractionAdapter(e[0])) as ConvInteractionAdapter).toIPayloadEvent()));

    }

    /**
     * Initial request to make the system aware that the user is listening.
     */
    public reception(attributes: object) {
        if (this.behaviourBind.length === 0) {
            this.bind(new KeyboardBehaviour(this.renderer));
            this.bind(new MouseBehaviour(this.renderer));
        }
        const payload ={ attributes, payload: {},type: MessageType.RECEPTION }
        const conversationHeader = ConversationHeaderBuilder.build(this.header, this.userProperties, payload)
        this.mqttSensorQueue.publishConvInteraction(conversationHeader, this.interactionInterceptor.execute(payload));
    }

    public onMessage(conversationHeader: Map<string,string>, message: object) {
        let spec = message as ISpecification;
        if (spec.type !== "reception" && spec.elements) {
            spec = Object.assign(spec, {position: 'left', channelId: this.header.channelId});
            this.renderer.render(spec).forEach(element => {
                this.renderer.appendContent(element);
            });
        }
        super.onMessage(conversationHeader, message);
    }

}

export class ConvInteractionAdapter implements ConvInteraction {
    private eventMessage: IEventPayload;
    attributes: object;
    payload: object;
    type: string;

    constructor(eventPayload: IEventPayload) {
        this.eventMessage = eventPayload;
        this.attributes = this.eventMessage.attributes;
        this.payload = this.eventMessage.payload;
        this.type = MessageType[this.eventMessage.type];
    }

    public toIPayloadEvent(): IEventPayload {
        return this.eventMessage;
    }

}

