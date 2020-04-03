import {IBehaviour, IRenderer, ISpecification} from '../api';
import {ChannelType} from '../support/ChannelType';
import {Defaults} from '../support/Defaults';
import {Label} from "../renderable/label";
import {MessageType} from "../support/MessageType";

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
        this.gateway = null;
    }

    protected handler(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            const element = (this.target as HTMLInputElement);
            const value = element.value;

            if (this.gateway && value.replace(/^\s+|\s+$/g, "") !== "") {
                this.gateway.publish(ChannelType.TEXT, {type: MessageType.UTTERANCE, text: value});
                element.value = "";

                const payload = {type: Label.TYPE, text: value, position: "right"} as ISpecification;
                this.renderer.render(payload).forEach(e => this.renderer.appendContent(e));

                if (this.callback !== undefined) {
                    this.callback();
                }
            }
        }
    }

}
