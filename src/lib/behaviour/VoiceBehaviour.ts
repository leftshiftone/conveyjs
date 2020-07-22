import {IBehaviour} from "../api";
import {AudioRecorder} from "../audio/recorder/AudioRecorder";
import {WebRTCRecorder} from "../audio/recorder/WebRTCRecorder";
import {MessageType} from "../support/MessageType";
import EventStream from "../event/EventStream";
import {Subscription} from "../connection/Subscription";
import {BufferedAudioPlayer} from "../audio/player/BufferedAudioPlayer";
import {EventType} from "../event/EventType";

/**
 * IBehaviour implementation that listens for a onmouseup/down on the given recordButton.
 *
 * onmouseup starts the recording, onmousedown stops the recording and publishes an audio message
 * to the outbound audio channel.
 */
export class VoiceBehaviour extends IBehaviour {

    private readonly recorder: AudioRecorder;
    private readonly callback: (eventType: AudioEventType) => void;

    constructor(recordButton: HTMLButtonElement,
                recorder: AudioRecorder = WebRTCRecorder.instance(),
                callback: (eventType: AudioEventType) => void = () => undefined) {
        super(recordButton, [
            {type: AudioEventType.ON_MOUSE_DOWN, handler: () => this.startRecordingOnMouseDown()},
            {type: AudioEventType.ON_MOUSE_UP, handler: () => this.subscription && this.stopRecordingOnMouseUp(this.subscription)}
        ]);
        this.recorder = recorder;
        this.callback = callback;
    }

    /**
     *
     * @inheritDoc
     */
    public bind(gateway: Subscription): void {
        this.handleAudio(gateway);
        super.bind(gateway);
    }

    /**
     * Binds {@link AudioRecorder#startRecording} to {@link this#recordButton} when an "mousedown" event occurs
     */
    private startRecordingOnMouseDown(): void {
        this.recorder.startRecording();
        this.callback(AudioEventType.ON_MOUSE_DOWN);
    }

    /**
     * Binds {@link AudioRecorder#stopRecording} to {@link this#recordButton} when an "mouseup" event occurs
     */
    private stopRecordingOnMouseUp(gateway: Subscription): void {
        this.recorder.stopRecording().then(result =>
            EventStream.emitEvent({
                type: EventType.withChannelId(EventType.PUBLISH, this.channelId!),
                payload: {type: MessageType.AUDIO, payload: {}, attributes: {text: result}}
            }));
    }

    public handleAudio(msg: object): void {
        BufferedAudioPlayer.instance().play(msg);
    }
}

enum AudioEventType {
    ON_MOUSE_DOWN = "mousedown",
    ON_MOUSE_UP = "mouseup"
}
