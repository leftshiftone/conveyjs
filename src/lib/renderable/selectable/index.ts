import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from '../Renderables';
import {Timestamp} from "../timestamp";

/**
 * Implementation of the 'selectable' markup element.
 * A li HTML element is created and the class lto-selectable
 * is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Selectable implements IRenderable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const position = this.spec.position || 'left';
        const selectable = document.createElement('div');
        selectable.classList.add('lto-selectable', "lto-" + position);
        selectable.setAttribute("name", this.spec.name || "");

        if (this.spec.id !== undefined) {
            selectable.id = this.spec.id;
        }
        if (this.spec.class !== undefined) {
            this.spec.class.split(" ").forEach(e => selectable.classList.add(e));
        }

        selectable.appendChild(Timestamp.render());

        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => selectable.appendChild(x)));

        if (isNested) {
            selectable.classList.add('lto-nested');
        }
        return selectable;
    }
}

Renderables.register("selectable", Selectable);
