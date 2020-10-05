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
    private likeButtons: Map<RatingButtonType, RatingButton>;

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
        this.likeButtons = new Map<RatingButtonType, RatingButton>();
        this.likeButtons.set(RatingButtonType.LIKE, {
            type: RatingButtonType.LIKE,
            buttonNode: this.buttonLike,
            score: 1
        });
        this.likeButtons.set(RatingButtonType.DISLIKE, {
            type: RatingButtonType.DISLIKE,
            buttonNode: this.buttonDislike,
            score: 0
        });
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
            this.likeButtonOnClick(RatingButtonType.LIKE);
        });

        this.buttonDislike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            this.likeButtonOnClick(RatingButtonType.DISLIKE);
        });

        submitButton.onClick((ev: MouseEvent) => {
            const score = this.getScoreOfClickedButton();
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

    private likeButtonOnClick(buttonType: RatingButtonType) {
        this.ratingContainer.appendChild(this.commentForm);
        // The other button
        this.likeButtons.get((buttonType + 1) % RatingButtonType.__LENGTH)!.buttonNode.addAttributes({disabled: ""});
        this.likeButtons.get((buttonType + 1) % RatingButtonType.__LENGTH)!.buttonNode.setStyle({cursor: "not-allowed"});
        // The button that was clicked
        this.likeButtons.get(buttonType)!.buttonNode.addDataAttributes({clicked: true});
    }

    private getScoreOfClickedButton() : string {
        if (this.buttonLike.getDataAttribute("clicked")) {
            return this.likeButtons.get(RatingButtonType.LIKE)!.score.toString();
        }
        return this.likeButtons.get(RatingButtonType.DISLIKE)!.score.toString();
    }
}

Renderables.register("rating", Rating);

enum RatingButtonType {
    LIKE,
    DISLIKE,
    __LENGTH
}

interface RatingButton {
    type: RatingButtonType;
    buttonNode: INode;
    score: number;
}
