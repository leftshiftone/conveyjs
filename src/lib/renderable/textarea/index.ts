import {IRenderable, IRenderer, ISpecification} from '../../api';
import Renderables from '../Renderables';
import node from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'textarea' markup element.
 * A textarea HTML element is created and the given
 * attributes cols, rows, id, name, placeholder and class are applied.
 * The class lto-textarea is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Textarea implements IRenderable {

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const textarea = node("textarea");
        new Specification(this.spec).initNode(textarea, "lto-textarea");

        textarea.addAttributes({
            cols: this.spec.cols,
            rows: this.spec.rows,
            placeholder: this.spec.placeholder ? this.spec.placeholder : ""
        });

        if (this.spec.value) {
            (textarea.unwrap() as HTMLTextAreaElement).value = this.spec.value;
            textarea.unwrap().setAttribute("data-value", this.spec.value);
        }

        textarea.addClasses(isNested ? "lto-nested" : "");

        textarea.unwrap().addEventListener("input", () => {
                if ((textarea.unwrap() as HTMLTextAreaElement).value === "") {
                    textarea.unwrap().removeAttribute("data-value");
                } else {
                    textarea.unwrap().setAttribute("data-value", (textarea.unwrap() as HTMLTextAreaElement).value);
                }
            }
        );

        return textarea.unwrap();
    }
}

Renderables.register("textarea", Textarea);
