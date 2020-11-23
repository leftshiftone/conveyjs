import {FlexSearchIndex} from "../autocomplete/index/FlexSearchIndex";
import {toArray} from "rxjs/operators";

describe("FlexSearchIndex test", () => {

        it("index only returns entries starting with query", () => {
            const index = new FlexSearchIndex();
            index.add("abcde");
            index.add("bcde");
            index.add("bc");

            return new Promise((resolve, reject) =>
                index.search("bc")
                    .pipe(toArray())
                    .subscribe(result => expect(new Set(result)).toEqual(new Set(["bc", "bcde"])), reject, resolve));
        });

        it("index returns limit amount of elements at max", () => {
            const index = new FlexSearchIndex();
            index.add("test1");
            index.add("test 1");
            index.add("testing attention ");
            index.add("test123");
            index.add("test2");
            index.add("test3");
            index.add("test");


            return new Promise((resolve, reject) =>
                index.search("test", 10)
                    .pipe(toArray())
                    .subscribe(result => expect(new Set(result)).toEqual(new Set(["test1", "test2"])), reject, resolve));
        });

    }
);
