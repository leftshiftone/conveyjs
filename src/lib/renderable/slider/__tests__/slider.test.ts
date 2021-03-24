import Renderables from "../../Renderables";
import {Slider, ClassicRenderer} from "../../../../std";
import {fireEvent} from "@testing-library/dom"

describe("Slider", () => {
    beforeAll(() => {
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

        const nextButton = slider.querySelector(".lto-slider-next") as HTMLAnchorElement;
        expect(nextButton).not.toBeNull();
        fireEvent.click(nextButton);
        expect(attributes.getNamedItem("value")!!.value).toBe("test3");

        const prevButton = slider.querySelector(".lto-slider-prev") as HTMLAnchorElement;
        expect(prevButton).not.toBeNull();
        fireEvent.click(prevButton);
        expect(attributes.getNamedItem("value")!!.value).toBe("test2");
    });


});
