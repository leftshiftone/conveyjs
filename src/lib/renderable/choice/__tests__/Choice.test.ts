import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import Renderables from "../../Renderables";
import {MultipleChoice, SingleChoice} from "../index";
import {Label} from "../../label";
import {Image} from "../../../../std";
import {Choice} from "../Choice";
import {fireEvent} from "@testing-library/dom"

describe("Choice", () => {
    it("beforeAll", () => {
        Renderables.register("singleChoice", SingleChoice);
        Renderables.register("multipleChoice", MultipleChoice);
        Renderables.register("label", Label);
        Renderables.register("image", Image);
        Renderables.register("choice", Choice);
    });
    it("single choice test", () => {
        const mock = document.createElement("div");
        const singleChoice = new SingleChoice({
            type: "singleChoice", name: "singleC", elements: [{
                type: "choice", name: "choice", value: "multiLayerChoice",
                elements: [{
                        type: "label", text: "labelText"
                    },{
                        type: "image", src: "http://test.image.com"
                    }]
                },{
                type: "choice", name: "choice", value: "simpleChoice", text: "choiceText"
            }
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const choices = singleChoice.childNodes;
        expect(choices).not.toBeNull();

        // first choice
        const multiLayerChoice = choices.item(0).childNodes;
        expect(multiLayerChoice.length).toBe(1);
        const mlcChildren = multiLayerChoice.item(0).childNodes;
        expect(mlcChildren.length).toBe(3);
        expect((mlcChildren.item(0) as HTMLDivElement).classList).toContain("lto-label");
        expect((mlcChildren.item(1) as HTMLImageElement).classList).toContain("lto-image");
        expect((mlcChildren.item(2) as HTMLInputElement).value).toBe("choice");

        // second choice
        const simpleChoice = choices.item(1).childNodes;
        expect(simpleChoice.length).toBe(1);
        const scChildren = simpleChoice.item(0).childNodes;
        expect(scChildren.length).toBe(2);
        expect((scChildren.item(0) as Text).data).toBe("choiceText");
        expect((scChildren.item(1) as HTMLInputElement).value).toBe("choice");

        // test click event
        const mlcLabel = multiLayerChoice.item(0) as HTMLLabelElement;
        fireEvent.click(mlcLabel);
        expect(mlcLabel.classList.length).toBe(2);
        expect(mlcLabel.classList.item(0)).toBe("lto-toggle");
        expect(mlcLabel.classList.item(1)).toBe("lto-checked");

        const scLabel = simpleChoice.item(0) as HTMLLabelElement;
        expect(scLabel.classList.length).toBe(1);
        expect(scLabel.classList.item(0)).toBe("lto-unchecked");
        fireEvent.click(scLabel);
        expect(scLabel.classList.item(0)).toBe("lto-toggle");
        expect(scLabel.classList.item(1)).toBe("lto-checked");
        expect(mlcLabel.classList.length).toBe(1);
        expect(mlcLabel.classList.item(0)).toBe("lto-unchecked");
    });
    it("multiple choice test", () => {
        const mock = document.createElement("div");
        const multipleChoice = new MultipleChoice({
            type: "multiplechoice", name: "multiC", elements: [{
                type: "choice", name: "choice", value: "multiLayerChoice",
                elements: [{
                    type: "label", text: "labelText"
                },{
                    type: "image", src: "http://test.image.com"
                }]
            },{
                type: "choice", name: "choice", value: "simpleChoice", text: "choiceText"
            }
            ]
        }).render(new ClassicRenderer(mock, mock), false);

        const choices = multipleChoice.childNodes;
        expect(choices).not.toBeNull();

        // first choice
        const multiLayerChoice = choices.item(0).childNodes;
        expect(multiLayerChoice.length).toBe(1);

        // second choice
        const simpleChoice = choices.item(1).childNodes;

        // test click event
        const mlcLabel = multiLayerChoice.item(0) as HTMLLabelElement;
        fireEvent.click(mlcLabel);
        expect(mlcLabel.classList.length).toBe(2);
        expect(mlcLabel.classList.item(0)).toBe("lto-checked");
        expect(mlcLabel.classList.item(1)).toBe("lto-toggle");

        const scLabel = simpleChoice.item(0) as HTMLLabelElement;
        expect(scLabel.classList.length).toBe(0);
        fireEvent.click(scLabel);
        expect(scLabel.classList.item(0)).toBe("lto-checked");
        expect(scLabel.classList.item(1)).toBe("lto-toggle");
        expect(mlcLabel.classList.length).toBe(2);
        expect(mlcLabel.classList.item(0)).toBe("lto-checked");
        expect(mlcLabel.classList.item(1)).toBe("lto-toggle");

        fireEvent.click(scLabel);
        expect(scLabel.classList.item(0)).toBe("lto-unchecked");
        fireEvent.click(scLabel);
        expect(scLabel.classList.item(0)).toBe("lto-checked");
    });
});
