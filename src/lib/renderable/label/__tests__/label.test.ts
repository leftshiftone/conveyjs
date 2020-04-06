import {Label} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";

describe("LabelTest", () => {
    it("beforeAll", () => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });
    it("renderNested", () => {
        const label = new Label({type: "Label"});
        const element = label.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("lto-label lto-nexted");
    });
    it("renderNotNested", () => {
        const label = new Label({position: "right", type: "Label"});
        const container = label.render(new ContentCentricRenderer(), false);
        expect(container.tagName).toBe("DIV");
        expect(container.childElementCount).toBe(2);
        expect(container.children[1].className).toBe("lto-label lto-right")
    });
});
