import {Icon} from '../icon';
import {Timestamp} from '../timestamp';
import {IRenderable, IRenderer, ISpecification} from '../../api';
import Renderables from '../Renderables';
import {Specification} from "../../support/Specification";
import node from "../../support/node";
import {ACCESSIBILITY_DEFAULT_TAB_INDEX} from "../../renderer/Accessibility";

/**
 * Implementation of the 'label' markup element.
 * A div HTML element is crated and if the attributes
 * text and icon are set, they are applied.
 * The class lto-label is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 * @see {@link Icon}
 */
export class Label implements IRenderable {
    public static readonly TYPE = "label";

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const label = node("div");
        new Specification(this.spec).initNode(label, "lto-label");
        label.setAriaLabel(this.spec.ariaLabel);

        if (!isNested) {
            // if not nested means that this thing must be a user sent message
            // good thing that isn't complicated...
            label.unwrap().appendChild(Timestamp.render());
            const container = node("div");
            container.unwrap().appendChild(new Icon(this.spec.position || "left").render());
            container.appendChild(label);
            const unwrapped = container.unwrap();
            unwrapped.tabIndex = ACCESSIBILITY_DEFAULT_TAB_INDEX;
            return unwrapped;
        }

        label.addClasses("lto-nested");
        return label.unwrap();
    }
}

Renderables.register(Label.TYPE, Label);
