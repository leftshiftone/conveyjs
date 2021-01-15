import {IRenderer, ISpecification, IStackeable} from '../../api';
import {AbstractDecorator} from "./AbstractDecorator";
import {Rating} from "../../renderable/rating";

/**
 * The rating decorator adds two rating buttons (like, dislike)
 * after each system conversation output,
 * to allow users to give feedback.
 */
export class RatingDecorator extends AbstractDecorator {
    private readonly ratingsEnabledByDefault: boolean;

    constructor(renderer: IRenderer, ratingsEnabledByDefault = true) {
        super(renderer);
        this.ratingsEnabledByDefault = ratingsEnabledByDefault;
    }

    /**
     * Appends a rating to eligible interaction root containers. A container is eligible for rating rendering if
     * the rating markup element is specified and the enabled attribute is not set to false. A container is also
     * eligible for rating rendering if no rating markup element is specified and ratingsEnabledByDefault is set to
     * true.
     *
     * @param renderable the renderable specification which was received
     * @param containerType the parent container of the current renderable
     */
    render(renderable: ISpecification, containerType?: IStackeable): HTMLElement[] {
        const result = super.render(renderable, containerType);

        if (!containerType && this.shouldRenderRatingFor(renderable)) {
            // Append rating buttons to allow feedback
            const r: Rating = new Rating({type: Rating.TYPE, channelId: this.channelId});
            const ratingElement = r.render(this, false);
            result.push(ratingElement);
        }
        return result;
    }

    private shouldRenderRatingFor(renderable: ISpecification): boolean {
        if (!RatingDecorator.isRootContainerOfInteraction(renderable)) return false;
        const child = (renderable.elements || [{type: undefined, enabled: undefined}])[0];
        return (child.type === "rating" && child.enabled === true) || (this.ratingsEnabledByDefault && child.enabled !== false);

    }

    private static isRootContainerOfInteraction(renderable: ISpecification) {
        return renderable["type"] === "container"
            && renderable["position"] === "left"
            && renderable["qualifier"] !== null;
    }
}
