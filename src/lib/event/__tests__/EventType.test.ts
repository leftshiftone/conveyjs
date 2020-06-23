import {EventType} from "../EventType";

describe("EventType", () => {
    it("withClientId", () => {
        expect(EventType.withClientId(EventType.PUBLISH, "abc")).toEqual("GAIA::abc::PUBLISH");
        expect(EventType.withClientId(EventType.CAROUSEL, "abc")).toEqual("GAIA::abc::CAROUSEL");
    })
})
