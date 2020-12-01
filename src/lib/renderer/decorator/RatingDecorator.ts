import { IRenderer, ISpecification, IStackeable} from '../../api';
import {AbstractDecorator} from "./AbstractDecorator";
import {Rating} from "../../renderable/rating";

/**
 * The rating decorator adds two rating buttons (like, dislike)
 * after each system conversation output,
 * to allow users to give feedback.
 */
export class RatingDecorator extends AbstractDecorator {

    constructor(renderer: IRenderer) {
        super(renderer);
    }

    /**
     * @inheritDoc
     */
    render(renderable: ISpecification, containerType?: IStackeable): HTMLElement[] {
        const result = super.render(renderable, containerType);

        if (!containerType) {
            const qualifier = RatingDecorator.getQualifier(renderable);

            const type = RatingDecorator.getType(renderable);
            const position = RatingDecorator.getPosition(renderable);

            if (type === "container" && position === "left" && qualifier !== null) {
                // Append rating buttons to allow feedback
                const r: Rating = new Rating({type: Rating.TYPE, channelId: this.channelId});
                const ratingElement = r.render(this, false);
                result.splice(1, 0, ratingElement);
            }
        }

        return result;
    }

    private static getQualifier(renderable: ISpecification) {
        return (renderable !== undefined) ? renderable["qualifier"] : null;
    }

    private static getType(renderable: ISpecification) {
        return (renderable !== undefined) ? renderable["type"] : null;
    }

    private static getPosition(renderable: ISpecification) {
        return (renderable !== undefined) ? renderable["position"] : null;
    }
}
