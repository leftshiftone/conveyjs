import {FlexSearchIndex} from "../FlexSearchIndex";

describe("FlexSearchIndex test", () => {

        it("index only returns entries starting with query", () => {
            const index = new FlexSearchIndex();
            index.add("abcde");
            index.add("bcde");
            index.add("bc");

            return index.search("bc")
                .then(result => expect(new Set(result)).toEqual(new Set(["bc", "bcde"])));
        });

        // error case in flex search with different settings for encoding & tokenization
        it("index returns doesnt return multiples of elements", () => {
            const index = new FlexSearchIndex();
            index.add("Das ist ein");
            index.add("Das ist ein Test");

            return index.search("Das ist ein Test", 10)
                .then(result => expect(result.length).toEqual(1));
        });

        it("index returns limit amount of elements at max", () => {
            const index = new FlexSearchIndex();
            index.add("test1");
            index.add("test2");
            index.add("test3");
            index.add("test4");
            index.add("test5");

            return index.search("test", 2)
                .then(result => expect(result.length).toEqual(2));
        });


    it("configuration affects index", () => {
        const index = new FlexSearchIndex({encode: "extra"});
        index.add("test ok yes");

        return index.search("tst k yes", 5)
            .then(result => expect(result.length).toEqual(1));
    });

    it("clear removes all elements", () => {
        const index = new FlexSearchIndex();
        index.add("abc");
        index.add("abcd");
        index.clear();

        return index.search("abc", 10)
            .then(result => expect(result.length).toEqual(0));
    });
    }
);
