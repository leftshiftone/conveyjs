import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import {Timestamp} from '../timestamp';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'block' markup element. A div HTML element
 * is created and the and the classes lto-block is added to
 * allow CSS modifications.
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class Block implements IRenderable, IStackeable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const block = node("div");
        new Specification(this.spec).initNode(block, "lto-block");
        block.setAriaLabel(this.spec.ariaLabel);
        block.unwrap().appendChild(Timestamp.render());

        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => block.unwrap().appendChild(x)));

        isNested && block.addClasses('lto-nested');

        return block.unwrap();
    }
}

Renderables.register("block", Block);
