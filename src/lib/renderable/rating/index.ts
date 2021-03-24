import {IRenderable, IRenderer, ISpecification, IStackeable} from '../../api';
import node, {INode} from "../../support/node";
import {Specification} from "../../support/Specification";
import {EventType} from "../../event/EventType";
import EventStream from "../../event/EventStream";
import Renderables from "../Renderables";
import {NoopRating} from "./NoopRating";
import {ProcessNode} from "./ProcessNode";
import {EventPayloadFactory} from "../../event/EventPayloadFactory";

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
    private readonly ratedProcessNode: ProcessNode;

    constructor(message: ISpecification, ratedProcessNode: ProcessNode) {
        this.spec = message;
        this.ratedProcessNode = ratedProcessNode;
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
        commentForm.appendChild(node("input").addAttributes({type: "text"}).addAttributes({placeholder: "optional"}));
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
            const comment = (<HTMLInputElement>commentForm.unwrap().firstChild).value;
            const attributes = {comment};

            const ratingEvent = EventPayloadFactory.getRatingEventPayload(this.ratedProcessNode, score, attributes);

            const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);
            EventStream.emit(evType, ratingEvent);

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

Renderables.register("rating", NoopRating);
