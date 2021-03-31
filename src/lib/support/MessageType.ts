/**
 * Supported AIOS message types:
 * RECEPTION
 * UTTERANCE
 * BUTTON
 * SUBMIT
 * SUGGESTION
 */
export enum MessageType {
    RECEPTION = "reception",
    AUDIO = "audio",
    UTTERANCE = "utterance",
    BUTTON = "button",
    SUBMIT = "submit",
    SUGGESTION = "suggestion",
    RATING = "rating"
}
