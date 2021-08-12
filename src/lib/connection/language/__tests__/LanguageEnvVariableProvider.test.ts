import {LanguageEnvVariableProvider} from "../LanguageEnvVariableProvider";

describe("Converstaion language in env variables", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules(); // Most important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    it("found value", () => {
        process.env.CONVERSATION_LANGUAGE = 'de_at';
        expect(new LanguageEnvVariableProvider().get()).toEqual("de_at");

    });
});
