import {HTMLLanguageElementProvider} from "../HTMLLanguageElementProvider";

describe("Input", () => {

    it("Value of input is extracted to resolve the language", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = "es_MX";
        input.className = new HTMLLanguageElementProvider().LANGUAGE_CLASS;
        document.body.appendChild(input);

        expect(new HTMLLanguageElementProvider().get()).toEqual("es_MX");


    });
});
