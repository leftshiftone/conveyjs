import {LanguageProvider} from "./LanguageProvider";
export class LanguageEnvVariableProvider implements LanguageProvider{

    /**
     * Obtains the conversation language from the property 'CONVERSATION_LANGUAGE'
     */
    public get(): string | undefined {
        const conversationLanguage = process.env["CONVERSATION_LANGUAGE"];
        console.log("Calling LPP " + conversationLanguage);
        return conversationLanguage;
    }

    public toString(): string {
        return "Class [" + LanguageEnvVariableProvider.name + "] with value: " + this.get();
    }

}
