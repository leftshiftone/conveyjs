import {LanguageProvider} from "./LanguageProvider";

export class BrowserLanguageProvider implements LanguageProvider{

    /**
     * Obtains the default language of the browser
     */
    public get(): string {
        const conversationLanguage = navigator.language;
        console.log("Language from browser " + conversationLanguage);
        return conversationLanguage;
    }

    public toString(): string {
        return "Class [" + BrowserLanguageProvider.name + "] with value: " + this.get();
    }

}
