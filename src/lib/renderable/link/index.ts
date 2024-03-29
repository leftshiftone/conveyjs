import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'link' markup element. An
 * a HTML element is created and the given attributes
 * for href and target are taken over from the markup. The
 * class lto-link is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Link implements IRenderable {

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const link = node("a");
        link.addAttributes({
            href: Link.decode(this.spec.value || ""),
            target: '_blank'
        });
        new Specification(this.spec).initNode(link, "lto-link");
        return link.unwrap();
    }

    private static decode(input: string) {
        const txt = document.createElement("textarea");
        txt.innerHTML = input;
        return txt.value;
    }

}

Renderables.register("link", Link);
