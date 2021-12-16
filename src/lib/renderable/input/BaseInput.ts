import {ISpecification} from "../../api";
import node from "../../support/node";
import {Specification} from "../../support/Specification";

export class BaseInput {

    spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    initInput(type: string, className: string, isNested: boolean): HTMLInputElement {
        const input = node("input");
        new Specification(this.spec).initNode(input, className);
        input.setAriaLabel(this.spec.ariaLabel);
        input.addAttributes({
            type,
            placeholder: this.spec.placeholder || "",
            value: this.spec.value || "",
        });

        isNested && input.addClasses("lto-nested");

        const element = input.unwrap() as HTMLInputElement;
        element.addEventListener("change", () =>
            element.setAttribute('value', element.value)
        );

        return element;
    }
}
