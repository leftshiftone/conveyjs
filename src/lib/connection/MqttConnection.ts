import * as mqtt from 'mqtt';
import {ChannelNameFactory} from "../support/ChannelNameFactory";
import {ChannelType} from "../support/ChannelType";
import {IBehaviour, IListener, IPacket, IRenderer} from '../api';
import {uuid} from '../support/Uuid';
import EventStream from '../event/EventStream';
import {KeyboardBehaviour} from '../behaviour/KeyboardBehaviour';
import {MouseBehaviour} from '../behaviour/MouseBehaviour';
import {IMessage} from "../api/IMessage";
import {EventType} from "../event/EventType";

export class MqttConnection {

    private readonly callbacks: Map<ChannelType, (message: object) => void> = new Map();
    private readonly subscriptions: Array<string> = [];
    private readonly behaviourBind: Array<IBehaviour> = [];

    public readonly clientId: string;

    private readonly listener: IListener;
    private readonly renderer: IRenderer;
    private readonly identityId: string;
    private readonly userId: string;
    private readonly mqttClient: mqtt.MqttClient;
    private readonly removeFromEventStream: () => void;

    constructor(url: string, identityId: string, renderer: IRenderer, listener: IListener, username?: string | null, password?: string | null) {
        this.clientId = uuid();
        this.userId = uuid();
        this.listener = listener;
        this.identityId = identityId;
        this.renderer = renderer;
        this.renderer.setClientId(this.clientId);

        const connectionOptions: mqtt.IClientOptions = username && password ?
            {clean: false, clientId: this.clientId, username, password} :
            {clean: false, clientId: this.clientId};
        this.mqttClient = mqtt.connect(url, connectionOptions);
        this.initMqttListeners();
        this.removeFromEventStream = EventStream.addListener(EventType.withClientId(EventType.PUBLISH, this.clientId), this.publish.bind(this, ChannelType.TEXT)).remove;
        this.removeFromEventStream = EventStream.addListener(EventType.PUBLISH, this.publish.bind(this, ChannelType.TEXT)).remove;
    }

    public initMqttListeners() {
        this.mqttClient.on('connect', () => this.listener.onConnected());
        this.mqttClient.on('offline', () => this.listener.onConnectionLost());
        this.mqttClient.on('message', this.onMessage.bind(this));
        this.mqttClient.on('packetsend', (packet: IPacket) => this.listener.onPacketSend(packet));
    }

    /**
     * Disconnects from the mqtt connection.
     */
    public disconnect = () => {
        this.removeFromEventStream();
        this.behaviourBind.forEach(behaviour => behaviour.unbind());
        return this.mqttClient.end(false, () => this.listener.onDisconnected());
    }

    /**
     * Subscribes to the given destination.
     *
     * @param type the channel type
     * @param callback the callback function
     */
    public subscribe(type: ChannelType, callback: (message: object) => void) {
        if (this.subscriptions.indexOf(type) < 0) {
            this.subscriptions.push(type);

            const destination = this.incoming(type);
            this.mqttClient.subscribe(destination);

            const channelType = ChannelType.match(destination);
            this.callbacks!.set(channelType, callback);
        }
    }

    /**
     * Unsubscribes from the given destination
     *
     * @param destination the destination to unsubscribe from
     */
    public unsubscribe = (destination: string) => this.mqttClient.unsubscribe(destination);

    /**
     * Sends the given message to the given destination.
     *
     * @param channelType the channel type
     * @param msg the message
     */
    public publish(channelType: ChannelType, msg: IMessage) {
        const destination = this.outgoing(channelType);
        console.debug('Sending message to destination ' + destination);

        // noinspection SuspiciousTypeOfGuard
        const message = msg instanceof Array ? msg[0] : msg;
        const payload = JSON.stringify({body: message, header: this.header()});
        this.mqttClient.publish(destination, payload, this.mqttCallback(message));
    }

    /**
     * Initial request to make the system aware that the user is listening.
     */
    public reception(attributes?: object) {
        if (this.subscriptions.indexOf(ChannelType.TEXT) < 0) {
            this.subscribe(ChannelType.TEXT, () => {
            });
        }
        if (this.behaviourBind.length === 0) {
            this.bind(new KeyboardBehaviour(this.renderer));
            this.bind(new MouseBehaviour(this.renderer));
        }
        const payload = JSON.stringify({header: this.header(), body: {type: 'reception', attributes}});
        this.mqttClient.publish(this.outgoing(ChannelType.TEXT), payload, this.mqttCallback("reception"));
    }

    /**
     * Executes the registered channel type callback.
     *
     * @param type the channel type
     * @param msg the message
     */
    private callback = (type: ChannelType, msg: object) => (this.callbacks.get(type) || console.warn)(msg);

    private onMessage(topic: string, msg: string) {
        const channelType: ChannelType = ChannelType.match(topic);
        const message = JSON.parse(msg);

        if (channelType !== null) {
            switch (channelType) {
                case ChannelType.TEXT:
                    const payload = Object.assign(message, {position: 'left'});

                    this.listener.onMessage(payload);
                    this.renderer.render(payload).forEach(e => this.renderer.appendContent(e));

                    this.callback(channelType, message);
                    break;
                case ChannelType.CONTEXT:
                    this.callback(channelType, message);
                    break;
                case ChannelType.AUDIO:
                    this.callback(channelType, message);
                    break;
                case ChannelType.NOTIFICATION:
                    this.callback(channelType, message);
                    break;
                case ChannelType.LOG:
                    this.callback(channelType, message);
                    break;
                default :
                    console.error(`No such channel ${channelType} defined`);
            }
        }
    }

    /**
     * Binds the given IBehaviour to the MqttConnection.
     *
     * @param behaviour
     */
    public bind(behaviour: IBehaviour) {
        this.behaviourBind.push(behaviour);
        behaviour.bind(this);
    }

    private outgoing = (type: ChannelType) => ChannelNameFactory.clientOutgoing(this.clientId, this.identityId, type);
    private incoming = (type: ChannelType) => ChannelNameFactory.clientIncoming(this.clientId, this.identityId, type);

    private mqttCallback(msg: any) {
        return (error?: Error, packet?: mqtt.Packet) => {
            if (error) {
                console.error('Failed to publish message ' + error.message, error, packet);
            } else {
                console.debug('Successfully published message ' + JSON.stringify(msg));
            }
        };
    }

    private header = () => ({identityId: this.identityId, clientId: this.clientId, userId: this.userId});

}
