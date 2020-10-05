import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";
import {MessageType} from "../../support/MessageType";
import {EventType} from "../../event/EventType";
import EventStream from "../../event/EventStream";
import {IEventPayload} from "../../api/IEvent";

/**
 * TODO: Update doc
 * Implementation of the 'block' markup element. A div HTML element
 * is created and the and the classes lto-block is added to
 * allow CSS modifications.
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class Rating implements IRenderable, IStackeable {

    public static readonly TYPE = "rating";
    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
        this.setSpecPropertyIfNotDefined("type", "rating");
        this.setSpecPropertyIfNotDefined("name", "rating");
        this.setSpecPropertyIfNotDefined("position", "left");
        this.setSpecPropertyIfNotDefined("timestamp", new Date().getTime().toString());
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const text = this.spec.text || "";
        const name = this.spec.name || "";
        const value = this.spec.value || "";
        const attributes = {name, value};

        // Div for both buttons
        const rating = node("div");
        new Specification(this.spec).initNode(rating, "lto-rating");
        rating.addAttributes({type: Rating.TYPE});

        // Add like and dislike buttons
        const buttonLike = node("button");
        buttonLike.innerText('👍');
        rating.appendChild(buttonLike);
        const buttonDislike = node("button");
        rating.appendChild(buttonDislike);
        buttonDislike.innerText('👎');

        // Prepare comment form
        const commentForm = node("form");
        commentForm.appendChild(node("input").addAttributes({type: "text"}));
        const submitButton = node("button").innerText("Send rating");
        commentForm.appendChild(submitButton);

        buttonLike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            console.log("Clicked buttonLike");
            rating.appendChild(commentForm);
            buttonDislike.addAttributes({disabled: ""});
            buttonLike.addDataAttributes({clicked: true});
        });

        buttonDislike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            console.log("Clicked buttonDislike");
            rating.appendChild(commentForm);
            buttonLike.addAttributes({disabled: ""});
            buttonDislike.addDataAttributes({clicked: true});
        });

        submitButton.onClick((ev: MouseEvent) => {
            let score;
            if (buttonLike.getDataAttribute("clicked")) {
                score = "1";
            } else if (buttonDislike.getDataAttribute("clicked")) {
                score = "0";
            }
            const payload = {text, name, score};
            const type = MessageType.RATING;
            const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);
            EventStream.emit(evType, {attributes, type, payload} as IEventPayload);
        });

        return rating.unwrap();
    }

    private setSpecPropertyIfNotDefined(property: string, value: string) {
        this.spec[property] = (this.spec[property] === undefined ? value : this.spec[property]);
    }
}

Renderables.register("rating", Rating);
