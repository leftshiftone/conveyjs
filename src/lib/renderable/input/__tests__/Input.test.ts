import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Form, Text, Phone, Email, Submit} from "../../../../std";

describe("Input", () => {
    it("beforeAll", () => {
        Renderables.register("form", Form);
        Renderables.register("text", Text);
        Renderables.register("email", Email);
        Renderables.register("phone", Phone);
        Renderables.register("submit", Submit);
    });

    it("render", () => {
        console.warn = jest.fn();

        const mock = document.createElement("div");
        const form = new Form({
            type: "form", name: "form", elements: [
                {type: "text", name: "text", placeholder: "text placeholder", required: true},
                {type: "email", name: "email", value: "email@example.com", placeholder: "email placeholder"},
                {type: "phone", name: "phone", value: "phone value", placeholder: "phone placeholder"},
                {type: "submit", name: "submit", text: "submit"},
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const email = form.querySelector(".lto-email") as HTMLInputElement;
        const phone = form.querySelector(".lto-phone") as HTMLInputElement;
        const text = form.querySelector(".lto-text") as HTMLInputElement;
        const submit = form.querySelector(".lto-submit") as HTMLElement;

        expect(email.type).toBe("email");
        expect(phone.type).toBe("tel");
        expect(text.type).toBe("text");

        submit.click();

        expect(console.warn).toHaveBeenCalledWith("Input is required");
    });
});
