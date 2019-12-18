import {ISpecification} from "../../api";
import node, {INode} from "../../support/node";
import {InputContainer} from "../../support/InputContainer";
import {closestByClass} from "../../support/Elements";
import EventStream from "../../event/EventStream";
import {WayPoint} from "./IMarker";

export abstract class AbstractMap {

    protected spec: ISpecification;

    abstract readonly minZoom: number;
    abstract readonly maxZoom: number;
    abstract readonly defaultZoom: number;

    static DEFAULT_MARKER_ICON = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    static DEFAULT_SELECTED_MARKER_ICON = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

    protected constructor(spec: ISpecification) {
        this.spec = spec;
    }

    abstract setMarkersToValue(wrapper: INode): void;

    abstract resetAllMarkers(): void;

    abstract init(wrapper: INode): HTMLElement;

    public render = (className: string) => this.init(this.wrapper(className));

    public getMarkerIcon = () => this.spec.markerIcon ? this.spec.markerIcon : AbstractMap.DEFAULT_MARKER_ICON;
    public getSelectedMarkerIcon = () => this.spec.selectedMarkerIcon ? this.spec.selectedMarkerIcon : AbstractMap.DEFAULT_SELECTED_MARKER_ICON;

    public getZoom(): number {
        if (this.spec.zoom && this.spec.zoom >= this.minZoom && this.spec.zoom <= this.maxZoom) return this.spec.zoom;
        if (this.spec.zoom && this.spec.zoom > this.maxZoom) return this.maxZoom;
        if (this.spec.zoom && this.spec.zoom < this.minZoom) return this.minZoom;
        return this.defaultZoom;
    }

    public getCenter(): WayPoint {
        if (this.spec.centerBrowserLocation && navigator.geolocation)
            navigator.geolocation.getCurrentPosition(position => {
                    return {lat: position.coords.latitude, lng: position.coords.longitude};
                }, () => {
                    console.debug("Unable to init the map with current position");
                    return {lat: this.spec.centerLat || 0, lng: this.spec.centerLng || 0};
                }
            );
        return {lat: this.spec.centerLat || 0, lng: this.spec.centerLng || 0};
    }

    public setLabel(text: string, wrapper: INode) {
        const labelWrapper = wrapper.find(".lto-map-label");
        if (!labelWrapper) return;
        labelWrapper.unwrap().innerHTML = text;
    }

    static getMarkersFromSrc = (src: string) => fetch(src).then(data => data.json()).then(json => json.markers ? json.markers : null);

    public wrapper(className: string): INode {
        const wrapper = node("div");
        wrapper.addClasses(className, "lto-map", "lto-left");
        wrapper.setId(this.spec.id);
        wrapper.setName(this.spec.name);
        InputContainer.setRequiredAttribute(wrapper.unwrap(), this.spec.required);
        if (this.spec.class !== undefined) wrapper.addClasses(this.spec.class);
        const mapContainer = node("div");
        mapContainer.addClasses("lto-map-container");
        wrapper.appendChild(mapContainer);
        const label = node("div");
        label.addClasses("lto-map-label");
        wrapper.appendChild(label);
        EventStream.addListener("GAIA::map::reset::" + this.spec.name, () => {
                this.resetAllMarkers();
                this.setMarkersToValue(wrapper);
                this.setLabel("", wrapper);
            }
        );

        return wrapper;
    }

    public addMarkersToForm(wrapper: INode, selectedMarkers: Array<any>) {
        const form: HTMLElement | null = closestByClass(wrapper.unwrap(), ["lto-form"]);
        if (form) form.classList.remove("lto-submitable");
        if (selectedMarkers.length > 0) {
            if (form) form.classList.add("lto-submitable");
            wrapper.addDataAttributes({value: JSON.stringify(selectedMarkers)});
        } else wrapper.removeAttributes("data-value");
    }
}
