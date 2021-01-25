import {
    ConversationQueueType,
    MqttSensorQueue,
    QueueCallback,
    QueueHeader,
    QueueOptions,
} from "@leftshiftone/gaia-sdk/dist";
import {IListener, IPacket, IRenderer, ISpecification} from "../api";
import EventStream from "../event/EventStream";
import {Subscription} from "./Subscription";
import {InteractionSubscription} from "./InteractionSubscription";
import {ContentCentricRenderer} from "../renderer/ContentCentricRenderer";
import {IImpulse} from "../api/IImpulse";

export class Connection {

    public mqttSensorQueue: MqttSensorQueue;
    private readonly listener: IListener;
    private subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

    constructor(options: QueueOptions, listener: IListener) {
        this.mqttSensorQueue = this.initMqttSensorQueue(options);
        this.listener = listener;
    }
    /**
     * Subscribes to the selected queue.
     *
     * @param type the queue type
     * @param header the destination header
     * @param callback the callback function
     * @param renderer the renderer which is only used when the type is set to interaction
     */
    public subscribe(type: ConversationQueueType, header: QueueHeader, callback: QueueCallback, renderer?: IRenderer) {
        let r = renderer;
        if (type === ConversationQueueType.INTERACTION && !r) {
            console.error("Renderer is not set. Using fallback ContentCentricRenderer");
            r = new ContentCentricRenderer();
        }
        const subscription = type === ConversationQueueType.INTERACTION ?
            new InteractionSubscription(header, callback, this.mqttSensorQueue, r!) :
            new Subscription(type, header, callback, this.mqttSensorQueue);

        this.setSubscription(subscription);
        return subscription;
    }

    /**
     * Subscribes to the context queue.
     *
     * @param header the destination header
     * @param callback the callback function
     */
    public subscribeContext(header: QueueHeader, callback: QueueCallback) {
        const subscription = new Subscription(ConversationQueueType.CONTEXT, header, callback, this.mqttSensorQueue);
        this.setSubscription(subscription);
        return subscription;
    }

    /**
     * Subscribes to the notification queue.
     *
     * @param header the destination header
     * @param callback the callback function
     */
    public subscribeNotification(header: QueueHeader, callback: QueueCallback) {
        const subscription = new Subscription(ConversationQueueType.NOTIFICATION, header, callback, this.mqttSensorQueue);
        this.setSubscription(subscription);
        return subscription;
    }

    /**
     * Subscribes to the logging queue.
     *
     * @param header the destination header
     * @param callback the callback function
     */
    public subscribeLogging(header: QueueHeader, callback: QueueCallback) {
        const subscription = new Subscription(ConversationQueueType.LOGGING, header, callback, this.mqttSensorQueue);
        this.setSubscription(subscription);
        return subscription;
    }

    /**
     * Subscribes to the interaction queue.
     *
     * @param header the destination header
     * @param callback the callback function
     * @param renderer the renderer
     */
    public subscribeInteraction(header: QueueHeader, callback: QueueCallback, renderer: IRenderer) {
        const subscription = new InteractionSubscription(header, callback, this.mqttSensorQueue, renderer);
        this.setSubscription(subscription);
        return subscription;
    }

    private setSubscription(subscription: Subscription) {
        this.subscriptions.set(subscription.getTopic(), subscription);
    }

    /**
     * disconnect the mqtt connection
     */
    public disconnect() {
        EventStream.removeAllListeners();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.mqttSensorQueue.end(false, () => this.listener.onDisconnected());
    }

    private initMqttSensorQueue(options: QueueOptions): MqttSensorQueue {
        const mqttSensorQueue = new MqttSensorQueue(options);
        mqttSensorQueue.on('packetsend', (packet: IPacket) => this.listener.onPacketSend(packet));
        mqttSensorQueue.on('message', (topic: string, message: any) => this.onMessage(topic, message));
        mqttSensorQueue.on('connect', () => this.listener.onConnected());
        mqttSensorQueue.on('offline', () => this.listener.onConnectionLost());
        return mqttSensorQueue;
    }

    private onMessage(topic: string, message: any) {
        const subscription = this.subscriptions.get(topic)!;
        const spec = this.parseMessage(message, subscription.type);
        this.listener.onMessage(spec);
        subscription.onMessage(spec);
    }

    private parseMessage(message: any, queueType: ConversationQueueType) {
        const impulse = JSON.parse(message) as IImpulse;
        let spec;
        if (typeof impulse.payload === "string") {
            spec = JSON.parse(atob(impulse.payload as string)) as ISpecification;
        } else {
            spec = impulse.payload as ISpecification;
        }
        if (queueType === ConversationQueueType.INTERACTION) {
            spec.header = impulse.header;
        }
        return spec;
    }
}
