import node from "../node";
import {Specification} from "../Specification";
import {ISpecification} from "../../api";

describe("Specification test", () => {

    it("initNode inits a element with all possible parameters", () => {
        const spec: ISpecification = {
            type: "anyType",
            id: "id",
            name: "name",
            required: true,
            class: "lto-class2 lto-class3",
            text: "text"
        };
        const element = node("div");
        new Specification(spec).initNode(element, "lto-class");
        const htmlElement = element.unwrap() as HTMLElement;

        expect(htmlElement.id).toEqual("id");
        expect(htmlElement.getAttribute("name")).toEqual("name");
        expect(htmlElement.className).toEqual("lto-class lto-left lto-class2 lto-class3");
        expect(htmlElement.getAttribute("data-required")).toEqual("true");
        expect(htmlElement.innerText).toEqual("text");
    });

    it("initNode inits a element with no parameters set", () => {
        const spec: ISpecification = {
            type: "anyType"
        };
        const element = node("div");
        new Specification(spec).initNode(element, "lto-class");
        const htmlElement = element.unwrap() as HTMLElement;

        expect(htmlElement.hasAttribute("id")).toBeFalsy();
        expect(htmlElement.hasAttribute("name")).toBeFalsy();
        expect(htmlElement.hasAttribute("data-required")).toBeFalsy();
        expect(htmlElement.className).toBe("lto-class lto-left");
        expect(htmlElement.hasChildNodes()).toBeFalsy();
        expect(htmlElement.innerText).toBeUndefined();
    });
});
