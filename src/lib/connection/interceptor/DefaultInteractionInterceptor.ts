import {ConversationLanguageResolver} from "../language/ConversationLanguageResolver";
import {InteractionInterceptor} from "./InteractionInterceptor";
import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

/**
 * Intercepts all messages from convey before they are sent and enrich the attributes with the conversation language
 */
export class DefaultInteractionInterceptor implements InteractionInterceptor {

    private languageResolver = new ConversationLanguageResolver();

    /**
     * It goes through all language providers to extract the conversation language and enrich the attributes of the interaction with it.
     * Should the attributes contain the language, this will not be modified.
     *
     * @param interaction ConveyInteraction
     */
    public execute(interaction: ConvInteraction): ConvInteraction {
        if (interaction["attributes"]["language"] !== undefined) {
            console.log("Conversation language already in attributes with value: " + interaction["attributes"]["language"]);
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
