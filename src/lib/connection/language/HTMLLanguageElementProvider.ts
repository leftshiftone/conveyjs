import {LanguageProvider} from "./LanguageProvider";

export class HTMLLanguageElementProvider implements LanguageProvider {

    readonly LANGUAGE_CLASS = "lto-language";

    /**
     * Obtains the default language of the browser
     */
    public get(): string | undefined {
        const htmlLanguageElement = this.findHTMLLanguageElement();
        if (htmlLanguageElement === undefined) {
            console.error("No element with class '" + this.LANGUAGE_CLASS + "' could be found to resolve conversation language");
            return undefined;
        }
        const conversationLanguage = htmlLanguageElement.value;
        console.log("Language from HTML Element " + conversationLanguage);
        return conversationLanguage;
    }


    private findHTMLLanguageElement(): HTMLSelectElement | undefined {
        const elements = document.getElementsByClassName(this.LANGUAGE_CLASS);
        if (elements !== undefined && elements.length > 0) {
            return elements[0] as HTMLSelectElement;
        }
        return undefined;
    }

    public toString(): string {
        return "Class [" + HTMLLanguageElementProvider.name + "] with value: " + this.get();
    }

}
