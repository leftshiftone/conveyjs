import {Index} from "flexsearch";
import {IIndex} from "../../../../api";

interface IDocument {
    text: string;
}

export class FlexSearchIndex implements IIndex {

    readonly flexSearch: Index<IDocument>;

    constructor() {
        const flexsearch = require('flexsearch');
        this.flexSearch = flexsearch.create({
            encode: "advanced",
            tokenize: "reverse",
            suggest: true,
            cache: true,
            doc: {
                id: "text",
                field: ["text"]
            }
        });
    }

    add(element: string): void {
        this.flexSearch.add({text: element} as IDocument);
    }

    search(query: string, limit: number = 10): Promise<string[]> {
        return new Promise<IDocument[]>((resolve, reject) =>
        this.flexSearch.search({
            query,
            field: "text",
            limit
        }, result => resolve(result)))
            .then(result => result.map(element => element.text));
    }

}
