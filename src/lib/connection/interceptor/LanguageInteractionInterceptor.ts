import {InteractionInterceptor} from "./InteractionInterceptor";
import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

/**
 * It enriches the attributes of all convey interactions with a specific language
 *
 * @constructor language Code of language ISO 639-1 (format: "de","en","es"). Also locales such as en_US or en-US are allowed
 */
export class LanguageInteractionInterceptor implements InteractionInterceptor {
    private language: string;

    constructor(language: string) {
        this.language = language;
    }

    public execute(interaction: ConvInteraction): ConvInteraction {
        if (interaction["attributes"]["language"] !== undefined) {
            console.log("Conversation Language already in attributes: " + interaction["attributes"]["language"]);
            return interaction;
        }
        interaction["attributes"]["language"] = this.language;
        return interaction;
    }

}
