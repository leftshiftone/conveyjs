import {ContentCentricRenderer} from "../../../renderer/ContentCentricRenderer";
import {Rating} from "../index";
import EventStream from "../../../event/EventStream";
import {EventType} from "../../../event/EventType";

describe("RatingTest", () => {
    const newRating = () => new Rating({type: "rating"}, {
        executionGroupId: "123-executionGroupId",
        processId: "123-processId",
        identityId: "123-identityId",
        nodeId: "123-nodeId"
    });

    it("beforeAll", () => {
        document.body.innerHTML = `<div class="lto-gaia lto-content lto-suggest"/>`;
    });

    it("render", () => {
        const rating = newRating();

        const element = rating.render(new ContentCentricRenderer(), false);

        expect(element.tagName).toBe("DIV");
        expect(element.className).toContain("lto-rating");
        expect(element.childElementCount).toBeGreaterThan(1);
    });

    it("send rating", async () => {
        const rating = newRating();
        const element = rating.render(new ContentCentricRenderer(), false);

        (element.children[0] as HTMLButtonElement).click(); // Select thumbs up
        const form = element.querySelector("form")!!;
        (form.querySelector("input") as HTMLInputElement).value = "test comment"; // Add comment

        const ratingData = new Promise((resolve => {
            EventStream.addListener(EventType.PUBLISH, (data) => resolve(data[0])); // Get data sent by rating
        }));
        (form.querySelector("button") as HTMLButtonElement).click(); // Send rating

        const data = await ratingData;
        expect(data).not.toBeUndefined();
        expect(data["attributes"]["comment"]).toEqual("test comment");
        expect(data["payload"]["score"]).toEqual("1");
    });
});
