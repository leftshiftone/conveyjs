import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'video' markup element.
 * A video HTML element is created and the given attributes
 * id and src are applied from the markup. The lto-video
 * class is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Video implements IRenderable {

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const video = node("video");
        new Specification(this.spec).initNode(video, "lto-video");
        video.addAttributes({controls: true, src: this.spec.src});
        if (isNested) video.addClasses("lto-nested");
        return video.unwrap();
    }
}
Renderables.register("video", Video);
