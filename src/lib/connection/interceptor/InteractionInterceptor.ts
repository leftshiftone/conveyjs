import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

export interface InteractionInterceptor {
    execute(interaction : ConvInteraction): ConvInteraction;
}
