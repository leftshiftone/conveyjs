import {ConvInteraction} from "@leftshiftone/gaia-sdk/dist/mqtt/MqttSensorQueue";

/**
 * Contract that must be implement all interceptors to modify the convey interactions before they are sent to AIOS
 */
export interface InteractionInterceptor {
    execute(interaction : ConvInteraction): ConvInteraction;
}
