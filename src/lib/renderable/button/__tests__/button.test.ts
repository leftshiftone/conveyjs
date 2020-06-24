import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Form, Button} from "../../../../std";

describe("Button", () => {
    it("beforeAll", () => {
        Renderables.register("button", Button);
    });
    it("render <button><label>Test Button</label></button>", () => {
        const mock = document.createElement("div");
        mock.className = "lto-content";
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
    it("render <button>Test Button</button>", () => {
        const mock = document.createElement("div");
        mock.className = "lto-content";
        const mockCallBack = jest.fn();
        const form = new Form({
            type: "form", name: "form", elements: [{
                type: "button", name: "button", text: "Test Button", elements: [ ]
            }]
        }).render(new ClassicRenderer(mock, mock), false);
        const button = form.querySelector(".lto-button") as HTMLElement;
        button.onclick = mockCallBack;
        expect(button).not.toBeNull();
        expect(button.innerText).toContain('Test Button');
        button.click();
        expect(mockCallBack).toHaveBeenCalledTimes(1);
    });
});
