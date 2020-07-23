/**
 * This interface is used to specify an outgoing message
 */
import {MessageType} from "../support/MessageType";

export interface IEvent {
    type: string;
    payload: IEventPayload;
}

export interface IEventPayload {
    payload: object;
    attributes: object;
    type: MessageType;
}
