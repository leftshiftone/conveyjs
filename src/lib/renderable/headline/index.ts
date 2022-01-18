import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'headline' markup element.
 * With no level set, a h2 HTML element is created and the class
 * lto-headline is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Headline implements IRenderable {

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        let tag = "h2";
        if (this.spec.level) {
            tag = `h${this.spec.level}`;
        }

        const headline = node(tag);
        new Specification(this.spec).initNode(headline, "lto-headline");
        return headline.unwrap();
    }

}

Renderables.register("headline", Headline);
