import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import node, {INode} from "../../support/node";
import {Specification} from "../../support/Specification";
import {MessageType} from "../../support/MessageType";
import {EventType} from "../../event/EventType";
import EventStream from "../../event/EventStream";
import {IEventPayload} from "../../api/IEvent";

/**
 * Implementation of the 'rating' markup element. A div HTML element
 * is created and the class lto-rating is added to allow CSS modifications.
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class Rating implements IRenderable, IStackeable {

    public static readonly TYPE = "rating";
    private readonly spec: ISpecification;
    private readonly ratingContainer: INode;
    private ratingButtons: Map<RatingButtonType, RatingButton>;
    private selectedRatingButtonType: RatingButtonType;

    constructor(message: ISpecification) {
        this.spec = message;
        this.ratingContainer = node("div");
        this.ratingButtons = new Map<RatingButtonType, RatingButton>();
        this.selectedRatingButtonType = RatingButtonType.NOT_YET_SELECTED;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        // Div for both buttons
        new Specification(this.spec).initNode(this.ratingContainer, "lto-rating");
        this.ratingContainer.addAttributes({type: Rating.TYPE});

        this.renderRatingButton();

        return this.ratingContainer.unwrap();
    }

    private renderRatingButton() {
        // Like and dislike buttons
        const buttonLike = node("button").addClasses("lto-button");
        const buttonDislike = node("button").addClasses("lto-button");
        buttonLike.innerText('👍');
        this.ratingContainer.appendChild(buttonLike);
        buttonDislike.innerText('👎');
        this.ratingContainer.appendChild(buttonDislike);

        this.ratingButtons.set(RatingButtonType.LIKE, {
            type: RatingButtonType.LIKE,
            buttonNode: buttonLike,
            score: 1
        });
        this.ratingButtons.set(RatingButtonType.DISLIKE, {
            type: RatingButtonType.DISLIKE,
            buttonNode: buttonDislike,
            score: 0
        });

        // Comment form to be appended after rating button is clicked
        const commentForm = node("form").addClasses("lto-form");
        commentForm.appendChild(node("input").addAttributes({type: "text"}));
        const submitButton = node("button").innerText("Send rating").addClasses("lto-button");
        commentForm.appendChild(submitButton);

        // Click events
        buttonLike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            this.ratingButtonOnClick(RatingButtonType.LIKE, commentForm);
        });

        buttonDislike.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            this.ratingButtonOnClick(RatingButtonType.DISLIKE, commentForm);
        });

        submitButton.onClick((ev: MouseEvent) => {
            ev.preventDefault();
            const score = this.getScoreOfClickedButton();
            const payload = {score};

            const comment = (<HTMLInputElement>commentForm.unwrap().firstChild).value;
            const attributes = {comment};

            const type = MessageType.RATING;
            const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);
            EventStream.emit(evType, {attributes, type, payload} as IEventPayload);

            // Possibility to hide the rating container once it has been submitted
            this.ratingContainer.addClasses("lto-rating-submitted");
        });
    }

    private ratingButtonOnClick(buttonType: RatingButtonType, commentForm: INode) {
        this.ratingContainer.appendChild(commentForm);
        this.selectedRatingButtonType = buttonType;

        // The button that was clicked
        this.ratingButtons.get(buttonType)!.buttonNode.addClasses("lto-button-last-clicked");
        // The other button
        this.ratingButtons.get((buttonType + 1) % 2)!.buttonNode.removeClasses("lto-button-last-clicked");
    }

    private getScoreOfClickedButton(): string {
        return this.ratingButtons.get(this.selectedRatingButtonType)!.score.toString();
    }
}

Renderables.register("rating", Rating);

enum RatingButtonType {
    LIKE,
    DISLIKE,
    NOT_YET_SELECTED
}

interface RatingButton {
    type: RatingButtonType;
    buttonNode: INode;
    score: number;
}
