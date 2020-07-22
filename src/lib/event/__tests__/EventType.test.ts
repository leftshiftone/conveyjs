import {EventType} from "../EventType";

describe("EventType", () => {
    it("withClientId", () => {
        expect(EventType.withChannelId(EventType.PUBLISH, "abc")).toEqual("GAIA::publish::abc");
        expect(EventType.withChannelId(EventType.CAROUSEL, "abc")).toEqual("GAIA::carousel::abc");
    })
})
