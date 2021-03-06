import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Basket, Form, Text, Submit} from "../../../../std";

describe("Basket", () => {
    beforeAll(() => {
        Renderables.register("text", Text);
        Renderables.register("basket", Basket);
        Renderables.register("submit", Submit);
    });

    it("render", () => {
        const mock = document.createElement("div");
        const form = new Form({
            type: "form", name: "form", elements: [
                {type: "text", name: "text"},
                {type: "basket", name: "basket", elements: [{type: "text", name: "textInBasket"}]},
                {type: "submit", name: "submit", text: "submit"},
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const addBasketEnt = form.querySelector(".lto-add-to-basket") as HTMLElement;
        expect(addBasketEnt).not.toBeNull();

        // Add 2 entities
        addBasketEnt.click();
        addBasketEnt.click();

        // Assert that 2 entities have been added
        let basketEnts = form.querySelectorAll(".lto-basket-entity");
        expect(basketEnts).toHaveLength(2);

        const removeButtons: Array<HTMLElement> = [];

        // Assert that every entity has a text and a remove button as child node
        basketEnts.forEach(ent => {
            const input = ent.querySelector(".lto-text");
            const remove = ent.querySelector(".lto-remove-from-basket");
            expect(input).not.toBeNull();
            expect(remove).not.toBeNull();
            removeButtons.push(remove as HTMLElement);
        });

        // Remove all entities
        removeButtons.forEach(remove => remove.click());

        // Assert that every entity has been removed
        basketEnts = form.querySelectorAll(".lto-basket-entity");
        expect(basketEnts).toHaveLength(0);
    });
});
