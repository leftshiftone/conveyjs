import {ProcessNode} from "../renderable/rating/ProcessNode";
import {MessageType} from "../support/MessageType";
import {IEventPayload} from "../api/IEvent";

export class EventPayloadFactory {
    public static getRatingEventPayload(nodeToBeRated: ProcessNode, score: string, attributes: any) {
        const payload = Object.assign(nodeToBeRated, {score});
        const type = MessageType.RATING;
        return {attributes, type, payload} as IEventPayload;
    }
}
