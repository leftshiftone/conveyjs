import {IBehaviour, ISpecification} from "../api";
import {MqttConnection} from "../connection/MqttConnection";
import {AudioRecorder} from "../audio/recorder/AudioRecorder";
import {WebRTCRecorder} from "../audio/recorder/WebRTCRecorder";
import {ChannelType} from "../support/ChannelType";
import {BufferedAudioPlayer} from "../audio/player/BufferedAudioPlayer";

/**
 * IBehaviour implementation that listens for a onmouseup/down on the given recordButton.
 *
 * onmouseup starts the recording, onmousedown stops the recording and publishes an audio message
 * to the outbound audio channel.
 */
export class VoiceBehaviour extends IBehaviour {

    private readonly recorder: AudioRecorder;
    private readonly callback: (eventType: EventType) => void;

    constructor(recordButton: HTMLButtonElement,
                recorder: AudioRecorder = WebRTCRecorder.instance(),
                callback: (eventType: EventType) => void = () => undefined) {
        super(recordButton, [
            { type: EventType.ON_MOUSE_DOWN, handler: () => this.startRecordingOnMouseDown() },
            { type: EventType.ON_MOUSE_UP, handler: () => this.gateway && this.stopRecordingOnMouseUp(this.gateway) }
        ]);
        this.recorder = recorder;
        this.callback = callback;
    }

    /**
     *
     * @inheritDoc
     */
    public bind(gateway: MqttConnection): void {
        this.subscribeToAudioChannel(gateway);
        super.bind(gateway);
    }

    /**
     * Binds {@link AudioRecorder#startRecording} to {@link this#recordButton} when an "mousedown" event occurs
     */
    private startRecordingOnMouseDown(): void {
        this.recorder.startRecording();
        this.callback(EventType.ON_MOUSE_DOWN);
    }

    /**
     * Binds {@link AudioRecorder#stopRecording} to {@link this#recordButton} when an "mouseup" event occurs
     */

    private stopRecordingOnMouseUp(gateway: MqttConnection): void {
        this.recorder.stopRecording().then(result => {
            gateway.publish(ChannelType.AUDIO, {type: "text", text: result} as ISpecification);
        });
    }

    /**
     * Subscribes to the audio channel. Callback has no effect since message types are handled by {@link MqttConnection#onMessage}
     * @param gateway
     */
    private subscribeToAudioChannel(gateway: MqttConnection): void {
        gateway.subscribe(ChannelType.AUDIO, (msg: any) => {
            BufferedAudioPlayer.instance().play(msg);
        });
    }
}

enum EventType {
    ON_MOUSE_DOWN = "mousedown",
    ON_MOUSE_UP = "mouseup"
}
