import {
    ConversationQueueType,
    QueueHeader,
    QueueOptions,
    MqttSensorQueue,
    QueueCallback,
} from "@leftshiftone/gaia-sdk/dist";
import {IListener, IPacket, IRenderer, ISpecification} from "../api";
import EventStream from "../event/EventStream";
import {Subscription} from "./Subscription";

export class Connection {

    public mqttSensorQueue: MqttSensorQueue;
    private readonly listener: IListener;
    private readonly renderer: IRenderer;
    private subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

    constructor(options: QueueOptions, renderer: IRenderer, listener: IListener) {
        this.mqttSensorQueue = this.initMqttSensorQueue(options);
        this.renderer = renderer;
        this.listener = listener;
    }

    /**
     * Subscribes to the given destination.
     *
     * @param type the queue type
     * @param header the destination header
     * @param callback the callback function
     */
    public subscribe(type: ConversationQueueType, header: QueueHeader, callback: QueueCallback) {
        const subscription = new Subscription(type, header, callback, this.mqttSensorQueue, this.renderer);
        this.subscriptions.set(this.mqttSensorQueue.getTopic(type, header), subscription);
        return subscription;
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
