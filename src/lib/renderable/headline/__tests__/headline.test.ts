import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Block, Headline} from "../../../../std";

describe("Headline", () => {
    beforeAll(() => {
        Renderables.register("headline", Headline);
    });

    it("headline with level '1' should have the tag 'h1'", () => {
        const mock = document.createElement("div");
        const block = new Block({
            type: "block", elements: [
                {type: "headline", text: "text content", level: "1"},
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const headline = block.querySelector(".lto-headline") as HTMLElement;
        expect(headline).not.toBeNull();
        expect(headline.tagName).toBe("H1");
    });

    it("headline with unset level should have the tag 'h2'", () => {
        const mock = document.createElement("div");
        const block = new Block({
            type: "block", elements: [
                {type: "headline", text: "text content"},
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const headline = block.querySelector(".lto-headline") as HTMLElement;
        expect(headline).not.toBeNull();
        expect(headline.tagName).toBe("H2");
    });

});
