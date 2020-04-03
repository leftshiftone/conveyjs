import {IRenderable, IRenderer, ISpecification} from '../../../api';
import Renderables from '../../Renderables';
import {BaseInput} from "../BaseInput";

/**
 * Implementation of the 'phone' markup element.
 * An input HTML element is created and the given attributes name and
 * value are taken over from the markup. The class lto-phone is added
 * to allow CSS manipulations and a change listener is added.
 *
 * @see {@link IRenderable}
 */
export class Phone extends BaseInput implements IRenderable {

    constructor(spec: ISpecification) {
        super(spec);
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        return this.initInput("tel", "lto-phone", isNested);
    }
}

Renderables.register("phone", Phone);
