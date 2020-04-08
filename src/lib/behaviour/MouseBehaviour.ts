import {IBehaviour, IRenderer, ISpecification} from '../api';
import {ChannelType} from '../support/ChannelType';
import {Defaults} from '../support/Defaults';
import {MessageType} from "../support/MessageType";
import {Label} from "../renderable/label";

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
        this.gateway = null;
    }

    private handler() {
        const value = this.textArea.value;

        if (this.gateway && value.replace(/^\s+|\s+$/g, "") !== "") {
            this.gateway.publish(ChannelType.TEXT, {type: MessageType.UTTERANCE, text: value});
            this.textArea.value = "";

            const payload = {type: Label.TYPE, text: value, position: "right"} as ISpecification;
            this.renderer.render(payload).forEach(e => this.renderer.appendContent(e));

            if (this.callback !== undefined) {
                this.callback();
            }
        }
    }

}
