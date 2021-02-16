import Renderables from "../../renderable/Renderables";
import {Label} from "../../renderable/label";
import {Container} from "../../renderable/container";
import {Block} from "../../renderable/block";
import {NoopRating} from "../../renderable/rating/NoopRating";
import each from "jest-each";
import {RatingDecorator, RatingRenderStrategy} from "../decorator/RatingDecorator";
import {ContentCentricRenderer} from "../ContentCentricRenderer";
import {ISpecification} from "../../api";


describe("RatingDecorator test", () => {
    beforeAll(() => {
        Renderables.register("rating", NoopRating);
        Renderables.register("label", Label);
        Renderables.register("block", Block);
        Renderables.register("container", Container);
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        const gaiaDiv = document.createElement("div");
        gaiaDiv.classList.add("lto-gaia");

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("lto-content");

        const suggestDiv = document.createElement("div");
        suggestDiv.classList.add("lto-suggest");

        document.body.appendChild(gaiaDiv);
        document.body.appendChild(contentDiv);
        document.body.appendChild(suggestDiv);
    });

    each([
        ["rating markup is used & ratings are enabled by default", true, RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS],
        ["rating markup is used & ratings are disabled by default", true, RatingRenderStrategy.ONLY_ENABLED_RATINGS],
        ["rating markup is not used & ratings are enabled by default", false, RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS],
    ]).it("render rating if %s", (title: string, withRatingMarkup: boolean, ratingRenderStrategy: RatingRenderStrategy) => {
        const renderer = new RatingDecorator(new ContentCentricRenderer(), ratingRenderStrategy);
        const specification = RatingTestSpecGenerator.generate(withRatingMarkup, true);

        const rendered = renderer.render(specification);

        expectToBeRatingElement(rendered.pop());
    });

    each([
        ["rating markup is used, explicitly set to disabled & ratings are enabled by default", true, RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS],
        ["rating markup is not used & ratings are disabled by default", false, RatingRenderStrategy.ONLY_ENABLED_RATINGS],
    ]).it("do not render rating if %s", (title: string, withRatingMarkup: boolean, ratingRenderStrategy: RatingRenderStrategy) => {
        const renderer = new RatingDecorator(new ContentCentricRenderer(), ratingRenderStrategy);
        const specification = RatingTestSpecGenerator.generate(withRatingMarkup, false);

        const rendered = renderer.render(specification);

        expectNotToBeRatingElement(rendered.pop());
    });

    it("do not render rating if elements is empty", () => {
        const renderer = new RatingDecorator(new ContentCentricRenderer(), RatingRenderStrategy.ONLY_ENABLED_RATINGS);
        const specification = RatingTestSpecGenerator.generate(false, false);
        specification["elements"] = [];

        const rendered = renderer.render(specification);

        expectNotToBeRatingElement(rendered.pop());
    });

    it("do not render rating if enriched is incomplete", () => {
        const renderer = new RatingDecorator(new ContentCentricRenderer(), RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS);
        const specification = RatingTestSpecGenerator.generate(true, true);
        delete specification["enriched"].nodeId;

        const rendered = renderer.render(specification);

        expectNotToBeRatingElement(rendered.pop());
    });

    it("do not render rating if enriched does not exist", () => {
        const renderer = new RatingDecorator(new ContentCentricRenderer(), RatingRenderStrategy.ALL_EXCEPT_DISABLED_RATINGS);
        const specification = RatingTestSpecGenerator.generate(true, true);
        delete specification["enriched"];

        const rendered = renderer.render(specification);

        expectNotToBeRatingElement(rendered.pop());
    });

    function expectToBeRatingElement(element?: HTMLElement) {
        expect(element).not.toBeNull();
        // @ts-ignore
        expect(element.getAttribute("type")).toEqual("rating");
    }

    function expectNotToBeRatingElement(element?: HTMLElement) {
        expect(element).not.toBeNull();
        // @ts-ignore
        expect(element.getAttribute("type")).not.toEqual("rating");
    }

    afterAll(() => {
        Renderables.register("rating", undefined);
        Renderables.register("label", undefined);
        Renderables.register("block", undefined);
        Renderables.register("container", undefined);
    });
});

class RatingTestSpecGenerator {
    static generate(withRatingMarkup: boolean, ratingEnabled: boolean) {
        const content = [{
            class: "some-class",
            type: "block",
            elements: [
                {
                    class: "uppercase bold",
                    text: "Some very informative text",
                    type: "label"
                },
                {
                    text: "More very informative text",
                    type: "label"
                }
            ]
        }];

        if (withRatingMarkup) {
            return RatingTestSpecGenerator.wrapInContainer([{
                type: "rating",
                enabled: ratingEnabled,
                elements: content
            }]);
        }

        return RatingTestSpecGenerator.wrapInContainer(content);
    }

    private static wrapInContainer(elements: ISpecification[]) {
        return {
            type: "container",
            qualifier: "prompt:next",
            position: "left",
            enriched: {
                executionGroupId: "123-executionGroupId",
                processId: "123-processId",
                identityId: "123-identityId",
                nodeId: "123-nodeId"
            },
            elements
        } as ISpecification;
    }
}

