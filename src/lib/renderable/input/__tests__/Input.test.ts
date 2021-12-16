import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {Form, Text, Phone, Email, Submit} from "../../../../std";

describe("Input", () => {
    beforeAll(() => {
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
                {type: "text", name: "text", placeholder: "text placeholder", required: true, ariaLabel: "Text Input Field"},
                {type: "email", name: "email", value: "email@example.com", placeholder: "email placeholder", ariaLabel: "Email Input Field"},
                {type: "phone", name: "phone", value: "phone value", placeholder: "phone placeholder", ariaLabel: "Phone Input Field"},
                {type: "submit", name: "submit", text: "submit"},
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const email = form.querySelector(".lto-email") as HTMLInputElement;
        const phone = form.querySelector(".lto-phone") as HTMLInputElement;
        const text = form.querySelector(".lto-text") as HTMLInputElement;
        const submit = form.querySelector(".lto-submit") as HTMLElement;

        expect(email.type).toBe("email");
        expect(email.getAttribute("aria-label")).toBe("Email Input Field");
        expect(phone.type).toBe("tel");
        expect(phone.getAttribute("aria-label")).toBe("Phone Input Field");
        expect(text.type).toBe("text");
        expect(text.getAttribute("aria-label")).toBe("Text Input Field");

        submit.click();

        expect(console.warn).toHaveBeenCalledWith("Input is required");
    });
});
