import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Form, Button} from "../../../../std";

describe("Button", () => {
    it("beforeAll", () => {
        Renderables.register("button", Button);
    });
    it("render", () => {
        const mock = document.createElement("div");
        const mockCallBack = jest.fn();
        const form = new Form({
            type: "form", name: "form", elements: [{
                type: "button", name: "button", elements: [{
                    type: "label", text: "Test Button"
                }]
            },
            ]
        }).render(new ClassicRenderer(mock, mock), false);
        const button = form.querySelector(".lto-button") as HTMLElement;
        button.onclick = mockCallBack;
        expect(button).not.toBeNull();
        const label = button.querySelector(".lto-label") as HTMLElement;
        expect(label).not.toBeNull();
        expect(label.innerText).toContain('Test Button');
        button.click();
        expect(mockCallBack).toHaveBeenCalledTimes(1);
    });
});
