import {InteractionInterceptor} from "./InteractionInterceptor";
import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

export class LanguageInteractionInterceptor implements InteractionInterceptor{

    private language: string;

    constructor(language: string) {
        this.language = language;
    }

    public name(): string {
        return "languageInterceptor";
    }

    public execute(interaction : ConvInteraction): ConvInteraction {
        if (interaction["attributes"]["language"] !== undefined) {
            console.log("Conversation Language set in attributes: " + interaction["attributes"]["language"]);
            return interaction;
        }
        interaction["attributes"]["language"] = this.language;
        return interaction;
    }

}
