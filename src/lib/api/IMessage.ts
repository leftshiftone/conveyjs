/**
 * This interface is used to specify an outgoing message
 */
import {MessageType} from "../support/MessageType";
import {ISpecification} from "./ISpecification";

export interface IMessage extends ISpecification {
    type: MessageType;
}
