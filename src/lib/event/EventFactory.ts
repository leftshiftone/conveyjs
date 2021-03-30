import {ProcessNode} from "../renderable/rating/ProcessNode";
import {MessageType} from "../support/MessageType";
import {IEvent, IEventPayload} from "../api/IEvent";
import {EventType} from "./EventType";

export class EventFactory {
    channelId?: string;

    constructor(channelId?: string) {
        this.channelId = channelId;
    }

    public getRatingEvent(nodeToBeRated: ProcessNode, score: string, attributes: any): IEvent {
        const eventType = EventType.withChannelId(EventType.PUBLISH, this.channelId);
        const payload = Object.assign(nodeToBeRated, {score});
        const type = MessageType.RATING;
        const eventPayload = {attributes, type, payload} as IEventPayload;
        return {type: eventType, payload: eventPayload} as IEvent;
    }
}
