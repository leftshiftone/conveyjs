import {IRenderer, IRenderable, ISpecification} from '../../api';
import node, {INode} from "../../support/node";
import Renderables from "../Renderables";
import {Overlay} from "../overlays/Overlay";
import {Specification} from "../../support/Specification";

/**
 * Implementation of the 'trigger' markup element.
 * A div HTML element is created and the attributes id,
 * name and text from the markup are applied. The class
 * lto-trigger is added to allow CSS manipulations.
 *
 * @see {@link IRenderable}
 * @see {@link Overlay}
 */
export class Trigger implements IRenderable {

    private readonly spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const trigger = node("div");
        new Specification(this.spec).initNode(trigger, "lto-trigger");

        trigger.onClick(() => {
            const overlay = this.getOverlayFromContainer(trigger.getParentByClass("lto-container"));
            if (!overlay) {
                console.error(`No overlay with name ${this.spec.name} found`);
                return;
            }
            Overlay.show(overlay);
        });

        return trigger.unwrap();
    }

    private getOverlayFromContainer(container?: INode): INode | undefined {
        if (!container) return;
        return container.findAll(`.lto-overlays .lto-overlay[name="${this.spec.name!}"]`)[0]
    }

}

Renderables.register("trigger", Trigger);
