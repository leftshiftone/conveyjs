import {IRenderable, IRenderer, ISpecification} from '../../api';
import EventStream from '../../event/EventStream';
import Renderables from '../Renderables';
import {IEvent} from "../../api/IEvent";
import {EventType} from "../../event/EventType";
import {MessageType} from "../../support/MessageType";
import node from "../../support/node";
import {Specification} from "../../support/Specification";
import wrap from "../../support/node";

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
        const button = node("button");
        new Specification(this.spec).initNode(button, "lto-button");
        button.addAttributes({type: Button.TYPE});

        if (isNested) {
            button.addClasses("lto-nested");
        }

        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => button.appendChild(wrap(x))));

        if (button.containsClass("lto-left")) {
            button.onClick((ev: MouseEvent) => {
                ev.preventDefault();

                const text = this.spec.text || "";
                const name = this.spec.name || "";
                const value = this.spec.value || "";
                const event = {
                    type: EventType.create(EventType.PUBLISH, this.spec.clientId),
                    payload: {text, type: MessageType.BUTTON, attributes: {name, value, type: Button.TYPE}}
                } as IEvent;
                EventStream.emitEvent(event);

                Button.cleanupButtons(this.spec.interactionContentClassName!);

                // add right button
                const newButton = Object.assign(event.payload, {
                    class: this.spec.class,
                    position: "right",
                    timestamp: new Date().getTime(),
                    elements: this.spec.elements
                }) as ISpecification;
                renderer.render({type: "container", elements: [newButton]}).forEach(e => renderer.appendContent(e));
            });
        }
        return button.unwrap();
    }

    public static cleanupButtons(className: string) {
        const interactionContent = document.getElementsByClassName(className)[0];
        // remove left buttons from interaction content
        const buttons = interactionContent.querySelectorAll(".lto-button.lto-left");
        buttons.forEach(element => {
            if (element.classList.contains("lto-persistent")) {
                (element as HTMLElement).style.pointerEvents = "none";
            } else {
                element.remove();
            }
        });

        // remove left submits from interaction content
        const submits = interactionContent.querySelectorAll(".lto-submit.lto-left");
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
