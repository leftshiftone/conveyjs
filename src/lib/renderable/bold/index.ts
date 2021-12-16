import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'bold' markup element. A
 * b HTML element is created and the lto-bold class
 * is added to allow CSS modifications.
 *
 * @see {@link IRenderable}
 */
export class Bold implements IRenderable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const bold = node("b");
        new Specification(this.spec).initNode(bold, "lto-bold");
        bold.setAriaLabel(this.spec.ariaLabel);
        return bold.unwrap();
    }

}

Renderables.register("bold", Bold);
