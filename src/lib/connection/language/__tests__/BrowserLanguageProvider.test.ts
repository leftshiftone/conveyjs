import {BrowserLanguageProvider} from "../BrowserLanguageProvider";

describe("Converstaion language from browser", () => {

    Object.defineProperty(navigator, 'language', {
        get() { return 'de_at'; }
    });

    it("found value", () => {
        expect(new BrowserLanguageProvider().get()).toEqual("de_at");

    });

});
