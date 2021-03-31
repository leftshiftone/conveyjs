import {Link} from "../index";
import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";

describe("LinkTest", () => {
    beforeAll(() => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`
    });

    it("render", () => {
        const label = new Link({type: "Link"});
        const element = label.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("A");
        expect(element.className).toBe("lto-link");
        expect(element.getAttribute("href")).toBe("");
        expect(element.getAttribute("target")).toBe("_blank");
    });

    it("renderWithOptionals", () => {
        const label = new Link({
            id: "id",
            class: "lto-left lto-gaia",
            value: "https://www.leftshift.one",
            type: "Link"
        });
        const element = label.render(new ContentCentricRenderer(), true);
        expect(element.tagName).toBe("A");
        expect(element.className).toBe("lto-link lto-left lto-gaia");
        expect(element.id).toBe("id");
        expect(element.getAttribute("href")).toBe("https://www.leftshift.one");
        expect(element.getAttribute("target")).toBe("_blank");
    });
});
