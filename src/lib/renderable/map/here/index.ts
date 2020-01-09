import {AbstractMap} from "../AbstractMap";
import {INode} from "../../../support/node";
import {ISpecification} from "../../../api";
import Properties from "../../Properties";
import {IMarker} from "../IMarker";

export class HereMap extends AbstractMap {

    API_CORE = "https://js.api.here.com/v3/3.1/mapsjs-core.js";
    API_SERVICE = "https://js.api.here.com/v3/3.1/mapsjs-service.js";
    API_UI = "https://js.api.here.com/v3/3.1/mapsjs-ui.js";
    API_EVENTS = "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js";

    markers: Array<H.map.Marker> = [];
    map!: H.Map;
    markerIcon!: H.map.DomIcon;
    selectedMarkerIcon!: H.map.DomIcon;

    readonly defaultZoom = 8;
    readonly maxZoom = 20;
    readonly minZoom = 0;

    constructor(spec: ISpecification) {
        super(spec);
    }

    init(wrapper: INode): HTMLElement {
        this.initAPI().then(() => {
            const platform = this.createPlatform();
            this.initMap(wrapper, platform);
            this.initMarkers(wrapper);
            this.calculateRoute(platform, this.spec.routePoints);
        });
        return wrapper.unwrap();
    }

    // @ts-ignore
    createPlatform = () => new H.service.Platform({apikey: Properties.resolve("HERE_MAPS_API_KEY")})

    initMap(wrapper: INode, platform: H.service.Platform) {
        const layers = platform.createDefaultLayers();
        const map = new H.Map(
            wrapper.find('.lto-map-container').unwrap(),
            // @ts-ignore
            layers.vector.normal.map, {
                zoom: this.getZoom(), center: this.getCenter()
            }
        );

        H.ui.UI.createDefault(map, layers, 'de-DE');
        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        this.map = map;
    }

    initMarkerIcons() {
        const markerIcon = document.createElement("img");
        markerIcon.src = this.getMarkerIconSrc();
        markerIcon.width = Properties.resolve("HERE_MAPS_MARKER_WIDTH") || 32;
        markerIcon.height = Properties.resolve("HERE_MAPS_MARKER_HEIGHT") || 32;
        markerIcon.style.margin = Properties.resolve("HERE_MAPS_MARKER_MARGIN") || "-32px 0 0 -16px";
        const selectedMarkerIcon = document.createElement("img");
        selectedMarkerIcon.src = this.getSelectedMarkerIconSrc();
        selectedMarkerIcon.width = Properties.resolve("HERE_MAPS_SELECTED_MARKER_WIDTH") || 32;
        selectedMarkerIcon.height = Properties.resolve("HERE_MAPS_SELECTED_MARKER_HEIGHT") || 32;
        selectedMarkerIcon.style.margin = Properties.resolve("HERE_MAPS_SELECTED_MARKER_MARGIN") || "-32px 0 0 -16px";
        this.markerIcon = new H.map.DomIcon(markerIcon);
        this.selectedMarkerIcon = new H.map.DomIcon(selectedMarkerIcon);
    }

    initMarkers(wrapper: INode) {
        if (!this.spec.src) return;

        this.initMarkerIcons();

        let countSelections = 0;
        const maxSelections = this.spec.maxSelections || 1;
        let activeMarker: H.map.DomMarker;

        AbstractMap.getMarkersFromSrc(this.spec.src).then(markers => {
            if (!markers) return;
            markers.forEach((m: IMarker) => {
                const current = new H.map.DomMarker(m.position);
                current.setData({label: m.label || "", meta: m.meta || "", active: m.active, position: m.position});
                this.markers.push(current);
                m.active ? this.activateMarker(current) : this.deactivateMarker(current);
                current.addEventListener("pointerdown", () => {
                    if (maxSelections === 1) {
                        if (activeMarker) this.deactivateMarker(activeMarker);
                        this.activateMarker(current);
                        this.setLabel(current.getData().label, wrapper);
                        activeMarker = current;
                    } else if (current.getData().active) {
                        countSelections -= 1;
                        this.deactivateMarker(current);
                    } else if (countSelections < maxSelections) {
                        countSelections += 1;
                        this.activateMarker(current);
                    }
                    this.setMarkersToValue(wrapper);
                });

                this.map.addObject(current);
            });

            this.setMarkersToValue(wrapper);
        });
    }

    deactivateMarker(marker: H.map.DomMarker) {
        const data = marker.getData();
        data.active = false;
        marker.setData(data);
        marker.setIcon(this.markerIcon);
    }

    activateMarker(marker: H.map.DomMarker) {
        const data = marker.getData();
        data.active = true;
        marker.setData(data);
        marker.setIcon(this.selectedMarkerIcon);
    }

    resetAllMarkers = () => this.markers.forEach(marker => this.deactivateMarker(marker));

    calculateRoute(platform: H.service.Platform, routePoints?: string) {
        if (!routePoints) return;
        const parts = routePoints.split(";");
        const waypoint0 = parts[0];
        const waypoint1 = parts[1];
        const routeRequestParams = {
            mode: 'fastest;car',
            representation: 'display',
            routeattributes: 'waypoints,summary,shape,legs',
            maneuverattributes: 'direction,action',
            waypoint0, waypoint1
        };

        platform.getRoutingService().calculateRoute(routeRequestParams,
            result => this.onRoutingSuccess(result),
            error => this.onRoutingError(error));
    }

    onRoutingError = (error: Error) => console.error(error.name, ": ", error.message);

    onRoutingSuccess(result: H.service.ServiceResult) {
        if (result.response && result.response.route && result.response.route[0] && result.response.route[0].shape)
            this.addRouteShapeToMap(result.response.route[0].shape);
        else console.error("Route can't be displayed");
    }

    addRouteShapeToMap(routeShape: string[]) {
        const lineString = new H.geo.LineString();
        routeShape.forEach((point: string) => {
            const parts = point.split(',');
            lineString.pushLatLngAlt(Number(parts[0]), Number(parts[1]), 10);
        });

        const polylineOptions = Properties.resolve("HERE_MAPS_ROUTING_LINE_OPTIONS") ||
            {style: {lineWidth: 4, strokeColor: 'rgba(0, 128, 255, 0.7)'}};

        this.map.addObject(new H.map.Polyline(lineString, polylineOptions));
    }

    setMarkersToValue(wrapper: INode): void {
        const selectedMarkers: Array<{ position: { lat: number, lng: number }, meta: any }> = [];
        this.markers.forEach(marker => {
            if (marker.getData().active)
                selectedMarkers.push({position: marker.getData().position, meta: marker.getData().meta});
        });
        this.addMarkersToForm(wrapper, selectedMarkers);
    }

    initAPI = () => new Promise(resolve => this.includeScripts([this.API_CORE]).then(() => this.includeScripts([this.API_SERVICE, this.API_UI, this.API_EVENTS]).then(() => resolve())));

}
