export enum EventType {
    PUBLISH = "publish",
    CAROUSEL = "carousel"
}

export namespace EventType {
    export function create(eventType: EventType, clientId?: string) {
        return clientId ? `GAIA::${clientId}::${eventType}` : `GAIA::${eventType}`;
    }
}
