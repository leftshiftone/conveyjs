import {HTMLLanguageElementProvider} from "./HTMLLanguageElementProvider";
import {BrowserLanguageProvider} from "./BrowserLanguageProvider";
import {LanguageEnvVariableProvider} from "./LanguageEnvVariableProvider";

export class ConversationLanguageResolver {

    readonly LANGUAGE_PROVIDERS = [new LanguageEnvVariableProvider(), new HTMLLanguageElementProvider(), new BrowserLanguageProvider()];

    /**
     * It goes through all language providers to extract the converation language
     */
    public get(): string | undefined {
        const conversationLanguage = this.LANGUAGE_PROVIDERS.map(e => {
            const lang = e.get();
            console.log(e.toString);
            return lang;
        }).find(l => l !== undefined);
        if (conversationLanguage === undefined) {
            console.error("No language was configured for the conversation");
        }
        return conversationLanguage;
    }

}
