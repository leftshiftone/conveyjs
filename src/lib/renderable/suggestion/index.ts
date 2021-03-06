import {IRenderable, IRenderer, ISpecification} from '../../api';
import EventStream from '../../event/EventStream';
import Renderables from '../Renderables';
import {EventType} from "../../event/EventType";
import {MessageType} from "../../support/MessageType";
import {IEventPayload} from "../../api/IEvent";

/**
 * Implementation of the 'suggestion' markup element.
 */
export class Suggestion implements IRenderable {
    public static readonly TYPE = "suggestion";

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const position = this.spec.position || 'left';
        const button = document.createElement('button');
        button.setAttribute('name', this.spec.name || "");

        button.classList.add("lto-suggestion", "lto-" + position);
        if (this.spec.id !== undefined) {
            button.id = this.spec.id;
        }
        if (this.spec.class !== undefined) {
            this.spec.class.split(" ").forEach(e => button.classList.add(e));
        }

        if (isNested) {
            button.classList.add("lto-nested");
        }
        button.appendChild(document.createTextNode(this.spec.text || ""));

        if (position === "left") {
            button.addEventListener('click', () => {
                // remove left buttons
                const elements = document.querySelectorAll('.lto-suggestion.lto-left');
                elements.forEach(element => element.remove());

                const name = this.spec.name || "";
                const text = this.spec.text || "";
                const value = this.spec.value || "";

                const attributes = {name, value};
                const payload = {text, name, value};
                const type = MessageType.SUGGESTION;
                const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);
                EventStream.emit(evType, {attributes, type, payload} as IEventPayload);
            });
        }

        return button;
    }

}

Renderables.register(Suggestion.TYPE, Suggestion);
