export enum EventType {
    PUBLISH = "GAIA::publish",
    CAROUSEL = "GAIA::carousel"
}

export namespace EventType {
    export function withChannelId(eventType: EventType, channelId?: string): string {
        return channelId ? `${eventType}::${channelId}` : eventType;
    }

}
