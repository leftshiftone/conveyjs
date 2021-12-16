import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'item' markup element.
 * A li HTML element is created and the class lto-item
 * is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 * @see {@link Items}
 */
export class Item implements IRenderable {

    private spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const item = node("li");

        (this.spec.elements || []).map(e => renderer.render(e, this))
            .forEach(e => e.forEach(x => item.appendChild(node(x as HTMLElement))));

        new Specification(this.spec).initNode(item, "lto-item");

        isNested && item.addClasses("lto-nested");

        return item.unwrap();
    }

}

Renderables.register("item", Item);
