import {IRenderable, IRenderer, ISpecification, IStackeable} from "../../api";

export class NoopRating implements IRenderable, IStackeable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("lto-rating-container");
        const elements = (this.spec.elements || []).map(e => renderer.render(e));
        elements.forEach(e => e.forEach(x => div.appendChild(x)));
        return div;
    }
}
