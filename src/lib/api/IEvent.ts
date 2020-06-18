/**
 * This interface is used to specify an outgoing message
 */
import {MessageType} from "../support/MessageType";

export interface IEvent {
    type: string;
    payload?: IEventPayload;
}

export interface IEventPayload {
    position?: "left" | "right";
    text?: string;
    type?: MessageType;
    attributes?: object;
    timestamp?: string;
}
