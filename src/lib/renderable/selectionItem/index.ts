import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import {Timestamp} from '../timestamp';

/**
 * Implementation of the 'selectionItem' markup element. A div HTML element
 * is created and the and the classes lto-selection-tem is added to
 * allow CSS modifications.
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class SelectionItem implements IRenderable, IStackeable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const position = this.spec.position || 'left';
        const selectionItem = document.createElement('div');
        selectionItem.classList.add('lto-selection-item', "lto-" + position);
        selectionItem.setAttribute("name", this.spec.name || "");

        if (this.spec.id !== undefined) {
            selectionItem.id = this.spec.id;
        }
        if (this.spec.class !== undefined) {
            this.spec.class.split(" ").forEach(e => selectionItem.classList.add(e));
        }

        selectionItem.appendChild(Timestamp.render());

        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => selectionItem.appendChild(x)));

        if (isNested) {
            selectionItem.classList.add('lto-nested');
        }
        return selectionItem;
    }
}

Renderables.register("selectionItem", SelectionItem);
