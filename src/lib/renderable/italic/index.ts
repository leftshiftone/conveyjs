import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'italic' markup element.
 * An i HTML element is created, the attributes id and
 * text from the markup applied and the class
 * lto-italic is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Italic implements IRenderable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const italic = node("i");
        new Specification(this.spec).initNode(italic, "lto-italic");
        italic.setAriaLabel(this.spec.ariaLabel);
        return italic.unwrap();
    }

}

Renderables.register("italic", Italic);
