import {LanguageProvider} from "./LanguageProvider";

export class BrowserLanguageProvider implements LanguageProvider {

    /**
     * Obtains the default language of the browser
     */
    public get(): string {
        const conversationLanguage = navigator.language;
        console.log("Detected browser language " + conversationLanguage);
        return conversationLanguage;
    }

    public toString(): string {
        return "Class [" + BrowserLanguageProvider.name + "] with value: " + this.get();
    }

}
