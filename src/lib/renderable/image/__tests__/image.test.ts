import {Image, ClassicRenderer} from "../../../../std";
import Renderables from "../../Renderables";

describe("ImageTest", () => {
    it("beforeAll", () => {
        Renderables.register("img", Image);
    });

    it("render", () => {
        const mock = document.createElement("div");
        const img = new Image({
            type: "img",
            id: "testImage",
            src: "src/lib/renderable/image/__tests__/quokka_free.jpeg",
        }).render(new ClassicRenderer(mock, mock), false);

        const element = img as HTMLImageElement;
        expect(element).not.toBeNull();
        expect(element.src).toBe("http://localhost/src/lib/renderable/image/__tests__/quokka_free.jpeg");
        expect(element.id).toBe("testImage");
        expect(element.width).toBe(0);
        expect(element.height).toBe(0);
        expect(element.classList).toContain("lto-image");
        expect(element.classList).toContain("lto-left");
    })
});
