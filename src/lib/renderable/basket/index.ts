import {IRenderer, ISpecification, IRenderable, IStackeable} from '../../api';
import Renderables from '../Renderables';
import node, {INode} from "../../support/node";
import wrap from "../../support/node";
import {Specification} from "../../support/Specification";

/**
 * You can put elements into a basket and remove them as well.
 * Basket has a button to add a child component.
 * Each child has their own remove button.
 * For CSS manipulation use .lto-basket, .lto-basket-entity,.lto-add-to-basket, .lto-remove-from-basket
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class Basket implements IRenderable, IStackeable {

    private readonly spec: ISpecification;

    constructor(message: ISpecification) {
        this.spec = message;
    }

    /**
     * @inheritDoc
     */
    public render = (renderer: IRenderer) => this.renderBasket(renderer).unwrap();

    private renderBasket(renderer: IRenderer): INode {
        const basket = node("div");
        Specification.initNode(basket, this.spec, "lto-basket");
        basket.appendChild(this.renderAddButton(basket, renderer));
        return basket;
    }

    private renderBasketEntity(basket: INode, renderer: IRenderer): INode {
        const entity = node("div");
        entity.addClasses("lto-basket-entity");
        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));
        elements.forEach(e => e.forEach(x => entity.appendChild(wrap(x))));
        entity.appendChild(this.renderRemoveButton(basket, entity));
        return entity;
    }

    private static renderButton(className: string, callback: () => void): INode {
        const button = node("div");
        button.addClasses(className);
        button.onClick(callback);
        return button;
    }

    private renderAddButton = (basket: INode, renderer: IRenderer) => Basket.renderButton("lto-add-to-basket", () => basket.appendChild(this.renderBasketEntity(basket, renderer)));
    private renderRemoveButton = (basket: INode, entity: INode) => Basket.renderButton("lto-remove-from-basket", () => basket.removeChild(entity));
}

Renderables.register("basket", Basket);
