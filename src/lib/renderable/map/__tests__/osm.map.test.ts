import {OpenStreetMap} from "../osm";

describe("OSMTest", () => {

    let osm : OpenStreetMap;

    it("beforeAll", () => {
        osm = new OpenStreetMap({required:true, centerLng:1, centerLat:1, name:"map", type:"map"})
    });

    it("osm render", () => {
        const element = osm.render();
        expect(element.classList.contains("lto-map")).toBeTruthy();
        expect(element.dataset.required).toBe("true");
        expect(element.tagName).toBe("DIV");
        expect(element.getAttribute("name")).toBe("map");
        expect(element.getAttribute("data-value")).toBeNull();
    });
});
