import {IRenderer, ISpecification, IStackeable} from '../../api';
import {AbstractDecorator} from "./AbstractDecorator";
import {ProcessNode} from "../../renderable/rating/ProcessNode";
import {Rating} from "../../renderable/rating";

/**
 * The rating decorator adds two rating buttons (like, dislike)
 * after each system conversation output,
 * to allow users to give feedback.
 */
export class RatingDecorator extends AbstractDecorator {
    private readonly renderStrategy: RatingRenderStrategy;

    constructor(renderer: IRenderer, renderStrategy = RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS) {
        super(renderer);
        this.renderStrategy = renderStrategy;
    }

    /**
     * Appends a rating to eligible interaction root containers. A container is eligible for rating rendering if
     * the rating markup element is specified and the enabled attribute is not set to false. A container is also
     * eligible for rating rendering if no rating markup element is specified and ratingsEnabledByDefault is set to
     * true.
     *
     * @param renderable the renderable specification which was received
     * @param parentContainer the parent container of the current renderable
     */
    render(renderable: ISpecification, parentContainer?: IStackeable): HTMLElement[] {
        const result = super.render(renderable, parentContainer);
        if (!this.shouldRenderRatingFor(renderable, parentContainer)) return result;
        const processNode = ProcessNode.createFromSpecification(renderable);
        if (processNode === null) return result;

        // Append rating buttons to allow feedback
        const r: Rating = new Rating({
            type: Rating.TYPE,
            channelId: this.channelId
        }, processNode);
        const ratingElement = r.render(this, false);
        result.push(ratingElement);

        return result;
    }

    private shouldRenderRatingFor(renderable: ISpecification, parentContainer?: IStackeable): boolean {
        if (parentContainer) return false;
        if (!RatingDecorator.isRootContainerOfInteraction(renderable)) return false;

        const child = (renderable.elements || [undefined])[0] || {type: undefined, enabled: undefined};

        return (child.type === "rating" && child.enabled === true)
            || (this.renderStrategy === RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS && child.enabled !== false);

    }

    private static isRootContainerOfInteraction(renderable: ISpecification) {
        return renderable["type"] === "container"
            && renderable["position"] === "left"
            && renderable["qualifier"] !== null;
    }
}

export enum RatingRenderStrategy {
    ALL_EXCEPT_DISABLED_RATINGS,
    ONLY_ENABLED_RATINGS
}
