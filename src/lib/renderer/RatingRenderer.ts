import {ClassicRenderer} from './ClassicRenderer';
import {IRenderable, IStackeable} from '../api';
import EventStream from '../event/EventStream';
import {EventType} from "../event/EventType";

/**
 * TODO: Update doc
 * The content centric renderer tries to maximize the time a content is visible by updating
 * the content if possible or displaying interrupting actions like intent cascading by overlaying the content.
 */
export class RatingRenderer extends ClassicRenderer {

    private qualifier = null;
    private behaviour: (renderable: IRenderable, type?: IStackeable) => HTMLElement[] = (r, t) => this.defaultBehaviour(r, t);

    constructor(content?: HTMLElement, suggest?: HTMLElement) {
        super(content, suggest);
    }

    public init(channelId?: string) {
        super.init(channelId);
        EventStream.addListener(EventType.withChannelId(EventType.PUBLISH, channelId), (e) => {
        });
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

    private defaultBehaviour(renderable: IRenderable, containerType?: IStackeable) {
        console.log(renderable);
        console.log(`qualifier: ${this.qualifier}`);
        if (!containerType) {
            this.qualifier = RatingRenderer.getQualifier(renderable) || this.qualifier;
        }
        console.log(`qualifier: ${this.qualifier}`);
        const type = RatingRenderer.getType(renderable);
        console.log(`type: ${type}`);

        let appendRating = false;
        if (type === "container") {
            console.log("Found container element");
            appendRating = true;
        }
        return super.renderElement(renderable, containerType, appendRating);
    }

}
