import Renderables from "../../Renderables";
import {Slider, ClassicRenderer} from "../../../../std";

describe("Slider", () => {
    it("beforeAll", () => {
        Renderables.register("slider", Slider);
    });

    it("render", () => {
        const mock = document.createElement("div");
        const slider = new Slider(  {
            type: "slider",
            name: "slider",
            values: ["test1", "test2", "test3", "test4"],
            value: "1",
            step: "1"
        }).render(new ClassicRenderer(mock, mock), false);

        const sliderElement = slider.querySelector(".lto-slider") as HTMLInputElement;
        expect(sliderElement).not.toBeNull();
        const attributes = sliderElement.attributes;
        expect(attributes.getNamedItem("type")!!.value).toBe("range");
        expect(attributes.getNamedItem("min")!!.value).toBe("0");
        expect(attributes.getNamedItem("max")!!.value).toBe("3");
        expect(attributes.getNamedItem("value")!!.value).toBe("test2");
    });


});
