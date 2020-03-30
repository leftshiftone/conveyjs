import {IRenderable, IRenderer, ISpecification} from '../../../api';
import Renderables from '../../Renderables';
import {BaseInput} from "../BaseInput";

/**
 * Implementation of the 'email' markup element.
 * An input HTML element is created of type email with
 * the given attributes name, placeholder and value. The
 * class lto-email is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 */
export class Email extends BaseInput implements IRenderable {

    constructor(spec: ISpecification) {
        super(spec);
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        return this.initInput("email", "lto-email", isNested);
    }
}

Renderables.register("email", Email);
