import {IRenderer, ISpecification, IRenderable} from '../../api';
import Renderables from "../Renderables";

import {OpenStreetMap} from "./osm";
import {GoogleMap} from "./google";
import {HereMap} from "./here";

/**
 * Implementation of the 'map' markup element and has been
 * added to provide the integration of google maps or open
 * street map depending on the value of the mapType attribute
 * in the markup. The class lto-map is added to allow CSS manipulations.
 * If the mapType is 'google' the user needs to add the
 * GOOGLE_MAPS_API_KEY to the {@link Properties} registry.
 *
 * Available properties:
 * OSM_SELECTED_MARKER_HEIGHT to the {@link Properties} registry
 * OSM_SELECTED_MARKER_HEIGHT to the {@link Properties} registry
 * GOOGLE_MAPS_MARKER_HEIGHT to the {@link Properties} registry
 * GOOGLE_MAPS_SELECTED_MARKER_HEIGHT to the {@link Properties} registry
 * HERE_MAPS_API_KEY to the {@link Properties} registry
 * HERE_MAPS_ROUTING_LINE_OPTIONS to the {@link Properties} registry
 * HERE_MAPS_MARKER_HEIGHT to the {@link Properties} registry
 * HERE_MAPS_MARKER_WIDTH to the {@link Properties} registry
 * HERE_MAPS_MARKER_MARGIN to the {@link Properties} registry
 * HERE_MAPS_SELECTED_MARKER_HEIGHT to the {@link Properties} registry
 * HERE_MAPS_SELECTED_MARKER_WIDTH to the {@link Properties} registry
 * HERE_MAPS_SELECTED_MARKER_MARGIN to the {@link Properties} registry
 * HERE_MAPS_ROUTE_START_ICON_HEIGHT to the {@link Properties} registry
 * HERE_MAPS_ROUTE_START_ICON_WIDTH to the {@link Properties} registry
 * HERE_MAPS_ROUTE_START_ICON_MARGIN to the {@link Properties} registry
 * HERE_MAPS_ROUTE_END_ICON_HEIGHT to the {@link Properties} registry
 * HERE_MAPS_ROUTE_END_ICON_WIDTH to the {@link Properties} registry
 * HERE_MAPS_ROUTE_END_ICON_MARGIN to the {@link Properties} registry
 *
 * @see {@link IRenderable}
 */
export class Map implements IRenderable {

    public spec: ISpecification;

    constructor(spec: ISpecification) {
        this.spec = spec;
    }

    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        switch (this.spec.mapType) {
            case "here": return new HereMap(this.spec).render("lto-map-here");
            case "osm": return new OpenStreetMap(this.spec).render("lto-map-osm");
            case "google": return new GoogleMap(this.spec).render("lto-map-google");
            default: console.error(`'${this.spec.mapType}' is not supported - try to use 'google', 'here' or 'osm' instead`);
        }
        return document.createElement("div");
    }
}

Renderables.register("map", Map);
