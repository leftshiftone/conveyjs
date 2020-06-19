import {SelectionItem} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";

describe("SelectionItemTest", () => {
    it("beforeAll", () => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });

    it("render", () => {
        const selectionItem = new SelectionItem({type: "SelectionItem"});
        const element = selectionItem.render(new ContentCentricRenderer(), false);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-selection-item lto-left");
        expect(element.childElementCount).toBe(1);
    });

    it("renderMultipleSelectionItems", () => {
        const selectionItem = new SelectionItem({elements: [{type: "SelectionItem"},{type: "SelectionItem"}] , type: "SelectionItem", id: "3"});
        const element = selectionItem.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-selection-item lto-left lto-nested");
        expect(element.id).toBe("3")
        expect(element.childElementCount).toBe(3);
    });
});
