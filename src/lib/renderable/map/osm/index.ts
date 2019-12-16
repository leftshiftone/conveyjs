import {ISpecification} from "../../../api";
import node, {INode} from "../../../support/node";
import {AbstractMap} from "../AbstractMap";
import {IMarker} from "../IMarker";
import {Icon, LatLngLiteral, Marker,
    icon as createIcon,
    map as createMap,
    tileLayer as createTileLayer,
    marker as createMarker,
    Map as Osm} from "leaflet";
import "leaflet/dist/leaflet.css";

export class OpenStreetMap extends AbstractMap {

    private markerIcon: Icon | null = null;
    private selectedMarkerIcon: Icon | null = null;
    private markers: Array<Marker> = [];

    constructor(spec: ISpecification) {
        super(spec);
    }

    public render(): HTMLElement {
        const wrapper = this.getDefaultWrapper("lto-map-osm");
        this.initMap(wrapper);
        return wrapper.unwrap();
    }

    public initMap(wrapper: INode) {
        const mapContainer = node("div");
        mapContainer.addClasses("lto-map-container");
        wrapper.appendChild(mapContainer);

        const leafletSettings = {minZoom: this.minZoom, maxZoom: this.maxZoom};

        const osmUrl = 'https://cartodb-basemaps-{s}.globaleaflet.ssleaflet.fastly.net/dark_all/{z}/{x}/{y}.png';
        const osmAttrib = 'OpenStreetMap data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

        const map = createMap(mapContainer.unwrap(), leafletSettings).setView(this.getCenter(), this.getZoom());
        map.addLayer(createTileLayer(osmUrl, {subdomains: ['a', 'b', 'c'], attribution: osmAttrib}));

        this.setMarkerIcons();
        this.addMarkersToMap(wrapper, map);
        this.setMarkersToValue(wrapper);
    }

    public setMarkerIcons() {
        this.markerIcon = createIcon({iconUrl: this.spec.markerIcon ? this.spec.markerIcon : OpenStreetMap.DEFAULT_MARKER_ICON});
        this.markerIcon = createIcon({iconUrl: this.spec.selectedMarkerIcon ? this.spec.selectedMarkerIcon : OpenStreetMap.DEFAULT_SELECTED_MARKER_ICON});
    }

    public addMarkersToMap(wrapper: INode, map: Osm) {
        if (!this.spec.src) {
            return;
        }

        let countSelections = 0;
        const maxSelections = this.spec.maxSelections || 1;
        let activeMarker: Marker;

        OpenStreetMap.getMarkersFromSrc(this.spec.src).then((markers: Array<IMarker> | null) => {
            if (!markers) {
                return;
            }

            markers.forEach((marker: IMarker) => {
                const current = createMarker(marker.position);
                current.addTo(map);

                current.getElement()!.setAttribute("data-label", marker.label || "");
                current.getElement()!.setAttribute("data-meta", JSON.stringify(marker.meta) || "");
                current.getElement()!.setAttribute("data-active", JSON.stringify(marker.active || true));

                this.markers.push(current);

                marker.active ?
                    this.activateMarker(current) :
                    this.deactivateMarker(current);

                current.on("click", () => {
                    if (maxSelections === 1) {
                        if (activeMarker) {
                            this.deactivateMarker(activeMarker);
                        }
                        this.activateMarker(current);
                        this.setLabel(current.getElement()!.getAttribute("data-label") || "", wrapper);
                        activeMarker = current;
                    } else {
                        if (JSON.parse(current.getElement()!.getAttribute("data-active")!)) {
                            countSelections -= 1;
                            this.deactivateMarker(current);
                        } else if (countSelections < maxSelections) {
                            countSelections += 1;
                            this.activateMarker(current);
                        }
                    }
                    this.setMarkersToValue(wrapper);
                });
            });
        });
    }

    public deactivateMarker(marker: Marker) {
        marker.getElement()!.setAttribute("data-active", JSON.stringify(false));
        marker.setIcon(this.markerIcon!);
    }

    public activateMarker(marker: Marker) {
        marker.getElement()!.setAttribute("data-active", JSON.stringify(true));
        marker.setIcon(this.selectedMarkerIcon!);
    }

    setMarkersToValue(wrapper: INode) {
        const selectedMarkers: Array<{ position: LatLngLiteral, meta: Map<string, any> }> = [];
        this.markers.forEach(marker => {
            if (marker.getElement()) {
                const active = JSON.parse(marker.getElement()!.getAttribute("data-active")!);
                const meta = JSON.parse(marker.getElement()!.getAttribute("data-meta")!);
                if (active) {
                    // tslint:disable-next-line:object-shorthand-properties-first
                    selectedMarkers.push({position: marker.getLatLng()!, meta});
                }
            }
        });

        this.addMarkersToForm(wrapper, selectedMarkers);
    }

    resetAllMarkers() {
        this.markers.forEach(marker => {
            this.deactivateMarker(marker);
        });
    }

}
