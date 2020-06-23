import {ClassicRenderer} from './ClassicRenderer';
import {IRenderable, IStackeable} from '../api';
import EventStream from '../event/EventStream';
import {Overlay} from '../renderable/overlay';
import {Block} from '../renderable/block';
import {Container} from '../renderable/container';
import {EventType} from "../event/EventType";
import {Suggestion} from "../renderable/suggestion";

/**
 * The content centric renderer tries to maximize the time a content is visible by updating
 * the content if possible or displaying interrupting actions like intent cascading by overlaying the content.
 */
export class ContentCentricRenderer extends ClassicRenderer {

    private qualifier = null;
    private behaviour: (renderable: IRenderable, type?: IStackeable) => HTMLElement[] = (r, t) => this.defaultBehaviour(r, t);

    constructor(content?: HTMLElement, suggest?: HTMLElement) {
        super(content, suggest);
    }

    public initListeners() {
        super.initListeners();
        EventStream.addListener(EventType.withClientId(EventType.PUBLISH, this.clientId!), (e) => {
            if (e[0].type === Suggestion.TYPE) {
                this.behaviour = this.suggestionBehaviour(this.qualifier || "");
            }
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

    private defaultBehaviour(renderable: IRenderable, containerType?: IStackeable) {
        if (!containerType) {
            this.qualifier = ContentCentricRenderer.getQualifier(renderable) || this.qualifier;
        }
        return super.renderElement(renderable, containerType);
    }

    private suggestionBehaviour(qualifier?: string) {
        return (renderable: IRenderable, containerType?: IStackeable) => {
            if (ContentCentricRenderer.getQualifier(renderable) === qualifier) {
                const containers = document.getElementsByClassName("lto-container");
                const containerZ = containers[containers.length - 1];

                if (containerZ.parentElement) {
                    containerZ.parentElement.removeChild(containerZ);
                }

                this.behaviour = (r, t) => this.defaultBehaviour(r, t);
                return super.renderElement(renderable, containerType);
            }
            if (renderable instanceof Container) {
                return super.renderElement(new Overlay(renderable), new Block({type: "block"}));
            }
            return super.renderElement(renderable, new Block({type: "block"}));
        };
    }

}
