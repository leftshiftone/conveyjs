import Renderables from "../../Renderables";
import { ClassicRenderer, Overlays, Overlay} from "../../../../std";

describe("Overlays", () => {
    it("beforeAll", () => {
        Renderables.register("overlays", Overlays);
        Renderables.register("overlay", Overlay)
    });

    it("render", () => {
        const mock = document.createElement("div");
        const overlays = new Overlays({
            type: "overlays",
            elements: [
                {
                    type: "overlay",
                    trigger: "headlineTrigger",
                    elements: [{
                        type: "block",
                        name: "overlayHeadlineBlock",
                        elements: [{
                            type: "headline",
                            text: "headline1"
                        }]
                    }]
                },
                {
                    type: "overlay",
                    trigger: "overlayFormTrigger",
                    elements: [{
                        type: "form",
                        name: "overlayForm",
                        elements: [{
                            type: "label",
                            name: "label1"
                        }]
                    }]
            }]
        }).render(new ClassicRenderer(mock, mock), false);

        const overlayList = overlays.getElementsByClassName("lto-overlay");
        expect(overlayList).not.toBeNull();
        expect(overlayList.length).toBe(2)
    });
});
