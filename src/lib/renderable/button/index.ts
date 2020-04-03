import {IRenderable, IRenderer, ISpecification} from '../../api';
import EventStream from '../../event/EventStream';
import Renderables from '../Renderables';
import {IEvent} from "../../api/IEvent";
import {EventType} from "../../event/EventType";
import {MessageType} from "../../support/MessageType";

/**
 * Implementation of the 'button' markup element.
 * A HTML button element is created with type button and
 * if given in the markup its name, text and value. The
 * class lto-button is added to allow CSS modifications.
 * For form submit buttons we refer to @see {@link Submit}
 *
 * @see {@link IRenderable}
 */
export class Button implements IRenderable {
    public static readonly TYPE = "button";

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const position = this.spec.position || "left";
        const button = document.createElement("button");
        button.setAttribute(`type`, Button.TYPE);

        button.setAttribute(`name`, this.spec.name || "");
        if (this.spec.id !== undefined) {
            button.id = this.spec.id;
        }
        if (this.spec.class !== undefined) {
            this.spec.class.split(" ").forEach(e => button.classList.add(e));
        }
        button.classList.add("lto-button", "lto-" + position);
        if (isNested) {
            button.classList.add("lto-nested");
        }
        button.appendChild(document.createTextNode(this.spec.text || ""));

        if (position === "left") {
            const eventListener = (ev: MouseEvent) => {
                ev.preventDefault();

                const text = this.spec.text || "";
                const name = this.spec.name || "";
                const value = this.spec.value || "";
                const event = {
                    type: EventType.PUBLISH,
                    payload: {text, type: MessageType.BUTTON, attributes: {name, value, type: Button.TYPE}}
                } as IEvent;
                EventStream.emitEvent(event);

                Button.cleanupButtons();

                // add right button
                const newButton = Object.assign(event.payload, {
                    class: this.spec.class,
                    position: "right",
                    timestamp: new Date().getTime()
                }) as ISpecification;
                renderer.render({type: "container", elements: [newButton]}).forEach(e => renderer.appendContent(e));
            };
            button.addEventListener("click", eventListener, {once: true});
        }
        return button;
    }

    public static cleanupButtons() {
        // remove left buttons
        const buttons = document.querySelectorAll(".lto-button.lto-left");
        buttons.forEach(element => {
            if (element.classList.contains("lto-persistent")) {
                (element as HTMLElement).style.pointerEvents = "none";
            } else {
                element.remove()
            }
        });

        // remove left submits
        const submits = document.querySelectorAll(".lto-submit.lto-left");
        submits.forEach(element => {
            if (element.classList.contains("lto-persistent")) {
                (element as HTMLElement).style.pointerEvents = "none";
            } else {
                element.remove();
            }
        });

        // remove left suggestions
        const suggestions = document.querySelectorAll(".lto-suggestion.lto-left");
        suggestions.forEach(element => element.remove());
    }
}

Renderables.register(Button.TYPE, Button);
