import {ISpecification} from "../../../api";
import {INode} from "../../../support/node";
import {AbstractMap} from "../AbstractMap";
import {IMarker} from "../IMarker";
import {Icon, icon, LatLngLiteral, Map as OSM, map, Marker, marker, tileLayer} from "leaflet";
import "leaflet/dist/leaflet.css";
import Properties from "../../Properties";

export class OpenStreetMap extends AbstractMap {

    private markerIcon?: Icon;
    private selectedMarkerIcon?: Icon;
    private markers: Array<Marker> = [];

    readonly maxZoom = 18;
    readonly minZoom = 0;
    readonly defaultZoom = 8;

    constructor(spec: ISpecification) {
        super(spec);
    }

    init(wrapper: INode): HTMLElement {
        const map = this.initMap(wrapper);
        this.initMarkers(wrapper, map);
        this.setMarkersToValue(wrapper);
        return wrapper.unwrap();
    }

    initMap(wrapper: INode) {
        const mapContainer = wrapper.find(".lto-map-container");
        return map(mapContainer.unwrap(), {minZoom: this.minZoom, maxZoom: this.maxZoom})
            .addLayer(tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}))
            .setView(this.getCenter(), this.getZoom());
    }

    initMarkers(wrapper: INode, map: OSM) {
        if (!this.spec.src) return;
        this.initMarkerIcons();

        let countSelections = 0;
        const maxSelections = this.spec.maxSelections || 1;
        let activeMarker: Marker;

        OpenStreetMap.getMarkersFromSrc(this.spec.src).then((markers: Array<IMarker> | null) => {
            if (!markers) return;

            markers.forEach((m: IMarker) => {
                const current = marker(m.position).addTo(map);

                current.getElement()!.setAttribute("data-label", m.label || "");
                current.getElement()!.setAttribute("data-meta", JSON.stringify(m.meta) || "");
                current.getElement()!.setAttribute("data-active", JSON.stringify(m.active || true));

                this.markers.push(current);

                m.active ? this.activateMarker(current) : this.deactivateMarker(current);

                current.on("click", () => {
                    if (maxSelections === 1) {
                        if (activeMarker) {
                            this.deactivateMarker(activeMarker);
                        }
                        this.activateMarker(current);
                        this.setLabel(current.getElement()!.getAttribute("data-label") || "", wrapper);
                        activeMarker = current;
                    } else
                        if (JSON.parse(current.getElement()!.getAttribute("data-active")!)) {
                            countSelections -= 1;
                            this.deactivateMarker(current);
                        } else if (countSelections < maxSelections) {
                            countSelections += 1;
                            this.activateMarker(current);
                        }
                    this.setMarkersToValue(wrapper);
                });
            });
        });
    }

    deactivateMarker(marker: Marker) {
        marker.getElement()!.setAttribute("data-active", JSON.stringify(false));
        marker.setIcon(this.markerIcon!);
    }

    activateMarker(marker: Marker) {
        marker.getElement()!.setAttribute("data-active", JSON.stringify(true));
        marker.setIcon(this.selectedMarkerIcon!);
    }

    initMarkerIcons() {
        const markerSize: [number, number] =
            [Properties.resolve("OSM_MARKER_WIDTH") as number || 32,
                Properties.resolve("OSM_MARKER_HEIGHT") as number || 32];
        const selectedMarkerSize: [number, number] =
            [Properties.resolve("OSM_SELECTED_MARKER_WIDTH") as number || 32,
                Properties.resolve("OSM_SELECTED_MARKER_HEIGHT") as number || 32];

        this.markerIcon = icon({iconUrl: this.getMarkerIconSrc(), iconSize: markerSize});
        this.selectedMarkerIcon = icon({iconUrl: this.getSelectedMarkerIconSrc(), iconSize: selectedMarkerSize});
    }

    setMarkersToValue(wrapper: INode) {
        const selectedMarkers: Array<{ position: LatLngLiteral, meta: Map<string, any> }> = [];
        this.markers.forEach(marker => {
            if (marker.getElement()) {
                const active = JSON.parse(marker.getElement()!.getAttribute("data-active")!);
                const meta = JSON.parse(marker.getElement()!.getAttribute("data-meta")!);
                if (active) {
                    selectedMarkers.push({position: marker.getLatLng()!, meta});
                }
            }
        });

        this.addMarkersToForm(wrapper, selectedMarkers);
    }

    resetAllMarkers = () => this.markers.forEach(marker => this.deactivateMarker(marker));

}
