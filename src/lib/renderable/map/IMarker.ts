export interface IMarker {
    position: WayPoint;
    meta?: Map<string, any>;
    label?: string;
    active: boolean;
}

export interface WayPoint {
    lat: number;
    lng: number;
}
