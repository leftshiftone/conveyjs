import {HTMLLanguageElementProvider} from "../../language/HTMLLanguageElementProvider";
import {DefaultInteractionInterceptor} from "../DefaultInteractionInterceptor";


describe("Converstaion language in env variables", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    beforeAll(() => {
        mockNavigatorLanguage("de_DE");
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    function mockNavigatorLanguage(language: string) {
        Object.defineProperty(navigator, 'language', {
            get() { return language; }
        });
    }
    function mockDocumentWithInput(language: string, inputClass: string) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = language;
        input.className = inputClass;
        document.body.appendChild(input);
    }
    function mockEnvVariableConversationLanguage(language: string) {
        process.env.CONVERSATION_LANGUAGE = language;
    }

    it("Append language to attributes", () => {
        mockDocumentWithInput("es_ES", new HTMLLanguageElementProvider().LANGUAGE_CLASS);
        mockEnvVariableConversationLanguage("de_AT");
        const att = {foo:"bar"};
        const pay = {text:"this is a message"};
        const typ = "type";
        const interaction = {attributes: att, payload: pay, type: typ };
        const interceptedInteraction = new DefaultInteractionInterceptor().execute(interaction);
        expect(interceptedInteraction.attributes["language"]).toEqual("de_AT");
        expect(interceptedInteraction.payload).toEqual(pay);
        expect(interceptedInteraction.type).toEqual(typ);
    });


    it("Do not override language if the attributes already contained that property", () => {
        mockDocumentWithInput("es_ES", new HTMLLanguageElementProvider().LANGUAGE_CLASS);
        mockEnvVariableConversationLanguage("de_AT");
        const att = {foo:"bar", language: "es_MX"};
        const pay = {text:"this is a message"};
        const typ = "type";
        const interaction = {attributes: att, payload: pay, type: typ };
        const interceptedInteraction = new DefaultInteractionInterceptor().execute(interaction);
        expect(interceptedInteraction.attributes["language"]).toEqual("es_MX");
        expect(interceptedInteraction.payload).toEqual(pay);
        expect(interceptedInteraction.type).toEqual(typ);
    });

});

