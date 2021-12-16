import {Icon} from '../icon';
import {Timestamp} from '../timestamp';
import {IRenderable, IRenderer, ISpecification} from '../../api';
import Renderables from '../Renderables';
import {Specification} from "../../support/Specification";
import node from "../../support/node";

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
            label.unwrap().appendChild(Timestamp.render());
            const container = node("div");
            container.unwrap().appendChild(new Icon(this.spec.position || "left").render());
            container.appendChild(label);
            return container.unwrap();
        }

        label.addClasses("lto-nested");
        return label.unwrap();
    }

}

Renderables.register(Label.TYPE, Label);
