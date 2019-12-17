import {ISpecification} from "../../../api";
import {INode} from "../../../support/node";
import {IMarker} from "../IMarker";
import {MarkerIcon} from "./MarkerIcon";
import {google} from "google-maps";
import Properties from "../../Properties";
import {AbstractMap} from "../AbstractMap";

declare const google: google;

export class GoogleMap extends AbstractMap {

    API = "https://maps.googleapis.com/maps/api/js?sensor=false&key=" + Properties.resolve("GOOGLE_MAPS_API_KEY");

    private markers: Array<google.maps.Marker> = [];
    private markerIcon: MarkerIcon | null = null;
    private selectedMarkerIcon: MarkerIcon | null = null;
    readonly minZoom: number = 0;
    readonly maxZoom: number = 19;
    readonly defaultZoom: number = 8;

    constructor(spec: ISpecification) {
        super(spec);
    }

    render() {
        const wrapper = this.getDefaultMapWrapper("lto-map-google");
        this.includeAPI().then(() => this.init(wrapper));
        return wrapper.unwrap();
    }

    private init(wrapper: INode) {
        console.debug("init google maps");
        const map = this.initMap(wrapper);
        this.initMarkers(map, wrapper);
        this.setMarkersToValue(wrapper);
    }

    public initMarkers(map: google.maps.Map, wrapper: INode) {
        this.initMarkerIcons();

        if (!this.spec.src)
            return;

        let countSelections = 0;
        const maxSelections = this.spec.maxSelections || 1;
        let activeMarker: google.maps.Marker;

        GoogleMap.getMarkersFromSrc(this.spec.src).then((markers: Array<IMarker> | null) => {
            if (!markers)
                return;

            markers.forEach((marker: IMarker) => {
                const current = new google.maps.Marker({map, position: marker.position});
                current.setValues({context: {label: marker.label, meta: marker.meta, active: marker.active}});
                this.markers.push(current);
                current.get("context").active ?
                    this.activateMarker(current) :
                    this.deactivateMarker(current);

                current.addListener("click", () => {
                        if (maxSelections === 1) {
                            if (activeMarker) this.deactivateMarker(activeMarker);
                            this.activateMarker(current);
                            this.setLabel(current.get("context").label || "", wrapper);
                            activeMarker = current;
                        } else {
                            if (current.get("active")) {
                                countSelections -= 1;
                                this.deactivateMarker(current);
                            } else if (countSelections < maxSelections) {
                                countSelections += 1;
                                this.activateMarker(current);
                            }
                        }
                        this.setMarkersToValue(wrapper);
                    }
                );
            });
        });
    }

    public initMap (wrapper: INode) {
        const map = new google.maps.Map(wrapper.find(".lto-map-container").unwrap(), {center: {lat: 0, lng: 0}, zoom: 8});
        map.setCenter(this.getCenter());
        map.setZoom(this.getZoom());
        return map;
    }

    public deactivateMarker(marker: google.maps.Marker) {
        marker.get("context").active = false;
        marker.setIcon(this.markerIcon);
    }

    public activateMarker(marker: google.maps.Marker) {
        marker.get("context").active = true;
        marker.setIcon(this.selectedMarkerIcon);
    }

    public includeAPI = () => new Promise(resolve => {
        if (!document.head.querySelectorAll(`[src="${this.API}"]`).length) {
            const script = document.createElement('script') as HTMLScriptElement;
            script.onload = () => {
                console.debug("load google maps API");
                resolve();
            };
            script.type = 'text/javascript';
            script.src = this.API;
            document.head.appendChild(script);
        } else resolve();
    })

    resetAllMarkers() {
        this.markers.forEach(marker => this.deactivateMarker(marker));
    }

    setMarkersToValue(wrapper: INode) {
        const selectedMarkers: Array<{ position: google.maps.LatLng, meta: Map<string, any> }> = [];
        this.markers.forEach(marker => {
            if (marker.get("context").active)
                selectedMarkers.push({position: marker.getPosition()!, meta: marker.get("context").meta});
        });

        this.addMarkersToForm(wrapper, selectedMarkers);
    }

    initMarkerIcons() {
        const markerSize = new google.maps.Size(
            Properties.resolve("GOOGLE_MAPS_MARKER_WIDTH") || 32,
            Properties.resolve("GOOGLE_MAPS_MARKER_HEIGHT") || 32);
        const selectedMarkerSize = new google.maps.Size(
            Properties.resolve("GOOGLE_MAPS_SELECTED_MARKER_WIDTH") || 32,
            Properties.resolve("GOOGLE_MAPS_SELECTED_MARKER_HEIGHT") || 32);

        this.markerIcon = new MarkerIcon(this.getMarkerIcon(), markerSize, markerSize);
        this.selectedMarkerIcon = new MarkerIcon(this.getSelectedMarkerIcon(), selectedMarkerSize, selectedMarkerSize);
    }
}
