import {ISpecification} from "../../api";

export class RatingTestSpecGenerator {
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
