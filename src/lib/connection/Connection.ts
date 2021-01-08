import {
    QueueHeader,
    QueueOptions,
    MqttSensorQueue,
    QueueCallback,
} from "@leftshiftone/gaia-sdk/dist";
import {IListener, IPacket, IRenderer, ISpecification} from "../api";
import EventStream from "../event/EventStream";
import {ContextSubscription, LoggingSubscription, NotificationSubscription, Subscription} from "./Subscription";
import {InteractionSubscription} from "./InteractionSubscription";

export class Connection {

    public mqttSensorQueue: MqttSensorQueue;
    private readonly listener: IListener;
    private subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

    constructor(options: QueueOptions, listener: IListener) {
        this.mqttSensorQueue = this.initMqttSensorQueue(options);
        this.listener = listener;
    }

    /**
     * Subscribes to the context queue.
     *
     * @param header the destination header
     * @param callback the callback function
     */
    public subscribeContext(header: QueueHeader, callback: QueueCallback) {
        const subscription = new ContextSubscription(header, callback, this.mqttSensorQueue);
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
        const subscription = new NotificationSubscription(header, callback, this.mqttSensorQueue);
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
        const subscription = new LoggingSubscription(header, callback, this.mqttSensorQueue);
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

    private initMqttSensorQueue(options: QueueOptions): MqttSensorQueue  {
        const mqttSensorQueue = new MqttSensorQueue(options);
        mqttSensorQueue.on('packetsend', (packet: IPacket) => this.listener.onPacketSend(packet));
        mqttSensorQueue.on('message', (topic: string, message: any) => this.onMessage(topic, message));
        mqttSensorQueue.on('connect', () => this.listener.onConnected());
        mqttSensorQueue.on('offline', () => this.listener.onConnectionLost());
        return mqttSensorQueue;
    }

    private onMessage(topic: string, message: any) {
        const payload = JSON.parse(message) as ISpecification;
        this.listener.onMessage(payload);
        this.subscriptions.get(topic)!.onMessage(payload);
    }

}
