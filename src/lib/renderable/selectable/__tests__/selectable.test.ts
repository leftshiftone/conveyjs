import {Selectable} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";

describe("SelectableTest", () => {
    beforeAll(() => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });

    it("render", () => {
        const selectable = new Selectable({type: "Selectable"});
        const element = selectable.render(new ContentCentricRenderer(), false);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-selectable lto-left");
        expect(element.childElementCount).toBe(1);
    });

    it("renderMultipleSelectables", () => {
        const selectable = new Selectable({elements: [{type: "Selectable"},{type: "Selectable"}] , type: "Selectable", id: "3"});
        const element = selectable.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-selectable lto-left lto-nested");
        expect(element.id).toBe("3")
        expect(element.childElementCount).toBe(3);
    });
});
