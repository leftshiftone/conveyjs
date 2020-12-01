import {IBehaviour, IRenderer, ISpecification} from '../api';
import {Defaults} from '../support/Defaults';
import {MessageType} from "../support/MessageType";
import {Label} from "../renderable/label";
import EventStream from "../event/EventStream";
import {EventType} from "../event/EventType";
import {MultiTargetRenderer} from "../renderer/MultiTargetRenderer";

/**
 * IBehaviour implementation which listens for a mouse click event in order to publish
 * a text message to the outgoing text channel.
 */
export class MouseBehaviour extends IBehaviour {

    private readonly textArea: HTMLTextAreaElement;
    private readonly renderer: IRenderer;
    private readonly callback: (() => void) | undefined;

    constructor(renderer: IRenderer, button?: HTMLButtonElement, textArea?: HTMLTextAreaElement, callback?: () => void) {
        super(button || Defaults.invoker(), {type: 'click', handler: () => this.handler()});
        this.textArea = textArea || Defaults.textbox();
        this.renderer = renderer;
        this.callback = callback;
        this.subscription = null;
    }

    private handler() {
        const value = this.textArea.value;

        if (this.isValueValid(value)) {
            const evType = EventType.withChannelId(EventType.PUBLISH, this.channelId!);
            const attributes = {text: value};
            const type = MessageType.UTTERANCE;
            EventStream.emit(evType, {type, payload: value, attributes});

            this.textArea.value = "";
            this.textArea.dispatchEvent(new Event("input", {}));

            const newElement = {type: Label.TYPE, text: value, position: "right", channelId: this.channelId} as ISpecification;
            this.renderer.render(newElement).forEach(e => {
                this.renderer instanceof MultiTargetRenderer ?
                    this.renderer.appendContent(e, this.channelId!) :
                    this.renderer.appendContent(e);
            });

            if (this.callback !== undefined) {
                this.callback();
            }
        }
    }

}
