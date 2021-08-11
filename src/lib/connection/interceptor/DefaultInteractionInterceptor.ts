import {ConversationLanguageResolver} from "../language/ConversationLanguageResolver";
import {InteractionInterceptor} from "./InteractionInterceptor";
import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

export class DefaultInteractionInterceptor implements InteractionInterceptor{

    private languageResolver: ConversationLanguageResolver;

    constructor() {
        this.languageResolver = new ConversationLanguageResolver();
    }

        /**
     * It goes through all language providers to extract the converation language
     */
    public execute(interaction : ConvInteraction): ConvInteraction {
        if (interaction["attributes"]["language"] !== undefined) {
            console.log("Conversation Language set in attributes: " + interaction["attributes"]["language"]);
            return interaction;
        }
        const conversationLanguage = this.languageResolver.get();
        if (conversationLanguage === undefined) {
            console.error("No conversation language defined!!!!!");
        }
        interaction["attributes"]["language"] = conversationLanguage;
        return interaction;
    }

}
