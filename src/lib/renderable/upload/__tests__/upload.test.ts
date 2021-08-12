import Renderables from "../../Renderables";
import {Form, Text, Submit, Upload, ClassicRenderer} from "../../../../std";
import {fireEvent} from "@testing-library/dom"
import * as fs from "fs";

describe("Upload", () => {
    beforeAll(() => {
        Renderables.register("text", Text);
        Renderables.register("upload", Upload);
        Renderables.register("submit", Submit);
    });

    it("render", () => {
        const mock = document.createElement("div");
        const form = new Form({
            type: "form", name: "form", elements: [
            {type: "text", name: "text"},
            {type: "block", name: "uploadBlock", elements: [
                    {type: "upload", maxSize: 5, name: "upload", accept: "jpeg"}
                ]}
        ]
        }).render(new ClassicRenderer(mock, mock), false);

        const dropArea = form.querySelector(".lto-drop-area") as HTMLElement;
        expect(dropArea).not.toBeNull();

        const inputElements = form.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;
        expect(inputElements).not.toBeNull();

        const fileBuffer = fs.readFileSync("src/lib/renderable/upload/__tests__/quokka-2676171_960_720.jpg");
        const file = new File([fileBuffer.toString('UTF-8')], 'quokka.jpeg', { type: 'image/jpeg' });
        const fileUpload = inputElements[1];
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(fileUpload.files).not.toBeNull();
        expect(fileUpload!.files![0]!.name!).toEqual("quokka.jpeg");
    });
});
