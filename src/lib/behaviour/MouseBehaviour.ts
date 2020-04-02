import {IBehaviour, IRenderer, ISpecification} from '../api';
import {ChannelType} from '../support/ChannelType';
import {Defaults} from '../support/Defaults';

/**
 * IBehaviour implementation which listens for a mouse click event in order to publish
 * a text message to the outgoing text channel.
 */
export class MouseBehaviour extends IBehaviour {

    private readonly target2: HTMLTextAreaElement;
    private readonly renderer: IRenderer;
    private readonly callback: (() => void) | undefined;

    constructor(renderer: IRenderer, target1?: HTMLButtonElement, target2?: HTMLTextAreaElement, callback?: () => void) {
        super(target1 || Defaults.invoker(), { type: 'click', handler: () => this.handler() });
        this.target2 = target2 || Defaults.textbox();
        this.renderer = renderer;
        this.callback = callback;
        this.gateway = null;
    }

    private handler() {
        const value = this.target2.value;

        if (this.gateway && value.replace(/^\s+|\s+$/g, "") !== "") {
            this.gateway.publish(ChannelType.TEXT, {type: "text", text: value});
            this.target2.value = "";

            const payload = {type:"text", text: value, position:"right"} as ISpecification;
            this.renderer.render(payload).forEach(e => this.renderer.appendContent(e));

            if (this.callback !== undefined) {
                this.callback();
            }
        }
    }

}
