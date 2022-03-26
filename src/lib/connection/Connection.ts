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
import {InteractionInterceptor} from "./interceptor/InteractionInterceptor";

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
     * @param interactionInterceptor intercepts the interaction
     */
    public subscribeInteraction(header: QueueHeader, callback: QueueCallback, renderer: IRenderer, interactionInterceptor?: InteractionInterceptor) {
        const subscription = new InteractionSubscription(header, callback, this.mqttSensorQueue, renderer, interactionInterceptor);
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
        mqttSensorQueue.on('message', (topic: string, message: any, packet: any) => this.onMessage(topic, message, packet));
        mqttSensorQueue.on('connect', () => this.listener.onConnected());
        mqttSensorQueue.on('offline', () => this.listener.onConnectionLost());
        return mqttSensorQueue;
    }

    private onMessage(topic: string, message: any, packet: any) {
        const conversationHeader = this.buildConversationHeader(packet)
        const payload = JSON.parse(message) as ISpecification;
        this.listener.onMessage(payload);
        this.subscriptions.get(topic)!.onMessage(conversationHeader, payload);
    }

    private addUserPropertyToConversationHeader(userProperty: any, propertyName: string, conversationHeader: Map<string, string>){
        if(userProperty!==undefined){
            const property = userProperty[propertyName]
            if(property!==undefined){
                conversationHeader.set(propertyName,property)
            }
        }
    }

    private buildConversationHeader(packet: any){
        const map = new Map()
        if (packet !== undefined && packet.properties !== undefined && packet.properties.userProperties !== undefined) {
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "nodeId", map)
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "previousPromptId", map)
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "behaviourInstanceId", map)
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "nodeInstanceId", map)
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "previousPromptId", map)
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "behaviourId", map)
        }
        return map
    }
}
