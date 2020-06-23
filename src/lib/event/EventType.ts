export enum EventType {
    PUBLISH = "GAIA::publish",
    CAROUSEL = "GAIA::carousel"
}

export namespace EventType {
    export function withClientId(eventType: EventType, clientId?: string): string {
        switch (eventType) {
            case EventType.CAROUSEL: return `GAIA::${clientId}::CAROUSEL`;
            case EventType.PUBLISH: return `GAIA::${clientId}::PUBLISH`;
        }
    }
}
