import Renderables from "../../Renderables";
import {Timestamp} from "../index";

describe("Timestamp", () => {
    it("beforeAll", () => {
        Renderables.register("timestamp", Timestamp);
    });

    it("render", () => {
        const timeStamp = Timestamp.render();

        expect(timeStamp).not.toBeNull();
        const element = timeStamp as HTMLElement;
        expect(element.classList).toContain("lto-timestamp");
        expect(element.firstChild).not.toBeNull();
        expect(element!!.firstChild!!.nodeType).toBe(3);
    });
});
