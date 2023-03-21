import {Timestamp} from '../timestamp';
import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'form' markup element.
 * A form HTML element is created and the class
 * lto-form is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 * @see {@link Submit}
 */
export class Form implements IRenderable, IStackeable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const form = node("form");
        new Specification(this.spec).initNode(form, "lto-form");
        form.setAriaLabel(this.spec.ariaLabel);

        // this prevents a page reload when pressing "enter" and thus submitting the form
        form.unwrap().onsubmit = () => false;

        form.unwrap().appendChild(Timestamp.render());

        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => form.unwrap().appendChild(x)));

        isNested && form.addClasses('lto-nested');

        return form.unwrap();
    }
}

Renderables.register("form", Form);
