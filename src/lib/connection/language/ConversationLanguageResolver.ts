import {HTMLLanguageElementProvider} from "./HTMLLanguageElementProvider";
import {BrowserLanguageProvider} from "./BrowserLanguageProvider";
import {LanguageEnvVariableProvider} from "./LanguageEnvVariableProvider";

/**
 * Contains language providers which are processed in the defined order.
 */
export class ConversationLanguageResolver {

    readonly LANGUAGE_PROVIDERS = [
        new LanguageEnvVariableProvider(),
        new HTMLLanguageElementProvider(),
        new BrowserLanguageProvider()
    ];

    /**
     * It goes through all language providers to extract the conversation language
     */
    public get(): string | undefined {
        const conversationLanguage = this.LANGUAGE_PROVIDERS.map(e => e.get()).find(l => l !== undefined);
        if (conversationLanguage === undefined) {
            console.error("No language was configured for the conversation");
        }
        return conversationLanguage;
    }

}
