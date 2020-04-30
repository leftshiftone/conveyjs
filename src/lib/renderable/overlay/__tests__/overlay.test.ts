import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {fireEvent} from "@testing-library/dom"
import {Item} from "../../item";
import {Overlay} from "../index";

describe("OverlayTest", () => {
    it("beforeAll", () => {
        Renderables.register("overlay", Overlay);
        Renderables.register("item", Item);
    });

    it("renderAndRemoveChild", () => {
        const mock = document.createElement("div");
        const overlay = new Overlay(new Item({elements: [{type: "Item"}], type: "Item"}));
        const overlayElement = overlay.render(new ClassicRenderer(mock, mock), true);
        const itemElement = overlayElement.children[0].children[1];
        const buttonElement = overlayElement.children[0].children[0];
        expect(itemElement.tagName).toBe("LI");
        expect(buttonElement.tagName).toBe("BUTTON");
        mock.appendChild(overlayElement);
        expect(overlayElement.parentElement).toBeTruthy();
        fireEvent.click(buttonElement, {button: 0});
        expect(overlayElement.parentElement).toBeFalsy()
    })
});
