import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import node, {INode} from "../../support/node";
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
    private readonly ratingContainer: INode;
    private readonly commentForm: INode;
    private readonly buttonLike: INode;
    private readonly buttonDislike: INode;
    private likeButtons: Map<ButtonType, INode>;

    constructor(message: ISpecification) {
        this.spec = message;
        this.setSpecPropertyIfNotDefined("type", "rating");
        this.setSpecPropertyIfNotDefined("name", "rating");
        this.setSpecPropertyIfNotDefined("position", "left");
        this.setSpecPropertyIfNotDefined("timestamp", new Date().getTime().toString());

        this.ratingContainer = node("div");
        this.commentForm = node("form");
        this.buttonLike = node("button");
        this.buttonDislike = node("button");
        this.likeButtons = new Map<ButtonType, INode>();
        this.likeButtons.set(ButtonType.LIKE, this.buttonLike);
        this.likeButtons.set(ButtonType.DISLIKE, this.buttonDislike);
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
        new Specification(this.spec).initNode(this.ratingContainer, "lto-rating");
        this.ratingContainer.addAttributes({type: Rating.TYPE});

        // Add like and dislike buttons
        this.buttonLike.innerText('👍');
        this.ratingContainer.appendChild(this.buttonLike);
        this.ratingContainer.appendChild(this.buttonDislike);
        this.buttonDislike.innerText('👎');

        // Prepare comment form
        this.commentForm.appendChild(node("input").addAttributes({type: "text"}));
        const submitButton = node("button").innerText("Send rating");
        this.commentForm.appendChild(submitButton);

        this.buttonLike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            this.likeButtonOnClick(ButtonType.LIKE);
        });

        this.buttonDislike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            this.likeButtonOnClick(ButtonType.DISLIKE);
        });

        submitButton.onClick((ev: MouseEvent) => {
            let score;
            if (this.buttonLike.getDataAttribute("clicked")) {
                score = "1";
            } else if (this.buttonDislike.getDataAttribute("clicked")) {
                score = "0";
            }
            const payload = {text, name, score};
            const type = MessageType.RATING;
            const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);
            EventStream.emit(evType, {attributes, type, payload} as IEventPayload);
        });

        return this.ratingContainer.unwrap();
    }

    private setSpecPropertyIfNotDefined(property: string, value: string) {
        this.spec[property] = (this.spec[property] === undefined ? value : this.spec[property]);
    }

    private likeButtonOnClick(buttonType: ButtonType) {
        this.ratingContainer.appendChild(this.commentForm);
        // The other button
        this.likeButtons.get((buttonType + 1) % ButtonType.__LENGTH)!.addAttributes({disabled: ""});
        this.likeButtons.get((buttonType + 1) % ButtonType.__LENGTH)!.setStyle({cursor: "not-allowed"});
        // The button that was clicked
        this.likeButtons.get(buttonType)!.addDataAttributes({clicked: true});
    }
}

Renderables.register("rating", Rating);

enum ButtonType {
    LIKE,
    DISLIKE,
    __LENGTH
}
