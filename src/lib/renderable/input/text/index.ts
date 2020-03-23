import {IRenderable, IRenderer, ISpecification} from '../../../api';
import Renderables from '../../Renderables';
import {BaseInput} from "../BaseInput";

/**
 * Implementation of the 'text' markup element.
 * An input HTML element of type text is created and
 * the given attributes name, placeholder and value from
 * the markup are applied. The class lto-text is
 * added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Text extends BaseInput implements IRenderable {

    constructor(spec: ISpecification) {
        super(spec);
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const text = this.initInput("text", "lto-text", isNested);
        text.pattern = this.spec.regex || "";
        return text;
    }
}

Renderables.register("text", Text);
