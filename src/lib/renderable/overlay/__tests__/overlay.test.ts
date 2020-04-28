import {Overlay} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";
import {fireEvent} from "@testing-library/dom"
import {Item} from "../../item";

describe("OverlayTest", () => {
    it("beforeAll", () => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });

    it("render", () => {
        const overlay = new Overlay(new Item({type:"item"}));
        const element = overlay.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-overlay");

    })

    it("removeChild", () => {
        const parentDiv = document.createElement("div");
        const overlay = new Overlay(new Item({elements: [{type: "Item"}] , type: "Item"}));
        const overlayElement = overlay.render(new ContentCentricRenderer(), true);
        const itemElement = overlayElement.children[0].children[1];
        const buttonElement = overlayElement.children[0].children[0];
        expect(itemElement.tagName).toBe("LI");
        expect(buttonElement.tagName).toBe("BUTTON");
        parentDiv.appendChild(overlayElement);
        expect(overlayElement.parentElement).toBeTruthy();
        fireEvent.click(buttonElement, {button: 0});
        expect(overlayElement.parentElement).toBeFalsy()
    })
});
