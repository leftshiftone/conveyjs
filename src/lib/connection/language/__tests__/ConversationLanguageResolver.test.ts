import {HTMLLanguageElementProvider} from "../HTMLLanguageElementProvider";
import {ConversationLanguageResolver} from "../ConversationLanguageResolver";

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

    it("Resolve language with Env Variable", () => {
        mockDocumentWithInput("es_ES", new HTMLLanguageElementProvider().LANGUAGE_CLASS);
        mockEnvVariableConversationLanguage("de_AT");
        expect(new ConversationLanguageResolver().get()).toEqual("de_AT");

    });

    it("Resolve language with HTML Element with class " + new HTMLLanguageElementProvider().LANGUAGE_CLASS, () => {
        mockDocumentWithInput("es_ES", new HTMLLanguageElementProvider().LANGUAGE_CLASS);
        expect(new ConversationLanguageResolver().get()).toEqual("es_ES");

    });

    it("Resolve language with Language of browser", () => {
        expect(new ConversationLanguageResolver().get()).toEqual("es_ES");

    });
});
