import {Item} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";

describe("ItemTest", () => {
    it("beforeAll", () => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });

    it("render", () => {
        const item = new Item({type: "Item"});
        const element = item.render(new ContentCentricRenderer(), false);
        expect(element.tagName).toBe("LI");
        expect(element.className).toBe("lto-item lto-left");
        expect(element.childElementCount).toBe(0);
    });

    it("renderMultipleItems", () => {
        const item = new Item({elements: [{type: "Item"},{type: "Item"}] , type: "Item"});
        const element = item.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("LI");
        expect(element.className).toBe("lto-item lto-left lto-nested");
        expect(element.childElementCount).toBe(2);
    });
});
