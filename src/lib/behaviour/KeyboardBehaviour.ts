import {IBehaviour, IRenderer, ISpecification} from '../api';
import {Defaults} from '../support/Defaults';
import {Label} from "../renderable/label";
import {MessageType} from "../support/MessageType";
import EventStream from "../event/EventStream";
import {EventType} from "../event/EventType";

/**
 * IBehaviour implementation which listens for a keyup event with code 13 in order to publish
 * a text message to the outgoing text channel.
 */
export class KeyboardBehaviour extends IBehaviour {

    private readonly renderer: IRenderer;
    private readonly callback: (() => void) | undefined;

    constructor(renderer: IRenderer, target?: HTMLTextAreaElement, callback?: () => void) {
        super(target || Defaults.textbox(), { type: 'keyup', handler: (event: Event) => this.handler(event as KeyboardEvent) });
        this.renderer = renderer;
        this.callback = callback;
        this.subscription = null;
    }

    protected handler(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            const element = (this.target as HTMLInputElement);
            const value = element.value;

            if (this.isValueValid(value)) {
                const evType = EventType.withChannelId(EventType.PUBLISH, this.channelId!);
                const payload = {};
                const attributes = {text: value};
                const type = MessageType.UTTERANCE;
                EventStream.emit(evType, {type, payload, attributes});

                element.value = "";
                const newElement = {type: Label.TYPE, text: value, position: "right"} as ISpecification;
                this.renderer.render(newElement).forEach(e => this.renderer.appendContent(e));

                if (this.callback !== undefined) {
                    this.callback();
                }
            }
        }
    }

}
