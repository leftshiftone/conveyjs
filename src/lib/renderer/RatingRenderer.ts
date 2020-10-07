import {ClassicRenderer} from './ClassicRenderer';
import {IRenderable, IStackeable} from '../api';

/**
 * The rating renderer adds two rating buttons (like, dislike)
 * after each system conversation output,
 * to allow users to give feedback.
 * Based on the content centric renderer.
 */
export class RatingRenderer extends ClassicRenderer {

    private qualifier = null;
    private behaviour: (renderable: IRenderable, type?: IStackeable) => HTMLElement[] = (r, t) => this.defaultBehaviour(r, t);

    constructor(content?: HTMLElement, suggest?: HTMLElement) {
        super(content, suggest);
    }

    public init(channelId?: string) {
        super.init(channelId);
    }

    /**
     * @inheritDoc
     */
    protected renderElement(renderable: IRenderable, containerType?: IStackeable): HTMLElement[] {
        return this.behaviour(renderable, containerType);
    }

    private static getQualifier(renderable: IRenderable) {
        return (renderable["spec"] !== undefined) ? renderable["spec"].qualifier : null;
    }

    private static getType(renderable: IRenderable) {
        return (renderable["spec"] !== undefined) ? renderable["spec"].type : null;
    }

    private static getPosition(renderable: IRenderable) {
        return (renderable["spec"] !== undefined) ? renderable["spec"].position : null;
    }

    private defaultBehaviour(renderable: IRenderable, containerType?: IStackeable) {
        if (!containerType) {
            this.qualifier = RatingRenderer.getQualifier(renderable) || this.qualifier;
        }
        const type = RatingRenderer.getType(renderable);
        const position = RatingRenderer.getPosition(renderable);
        let appendRating = false;
        if (type === "container" && position === "left" && this.qualifier !== null) {
            appendRating = true;
        }
        return super.renderElement(renderable, containerType, appendRating);
    }

}
