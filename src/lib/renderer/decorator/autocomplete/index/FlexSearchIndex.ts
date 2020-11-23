import {Index} from "flexsearch";
import {Observable} from "rxjs";
import {flatMap, map} from "rxjs/internal/operators";
import {fromArray} from "rxjs/internal/observable/fromArray";
import {IIndex} from "./IIndex";

interface IDocument {
    text: string;
}

export class FlexSearchIndex implements IIndex {

    readonly flexSearch: Index<IDocument>;

    constructor() {
        const flexsearch = require('flexsearch');
        this.flexSearch = flexsearch.create({
            encode: "extra",
            tokenize: "full",
            threshold: 1,
            resolution: 3,
            doc: {
                id: "text",
                field: ["text"]
            }
        });
    }

    add(element: string): void {
        this.flexSearch.add({text: element} as IDocument);
    }

    search(query: string, limit: number = 10): Observable<string> {
        return new Observable<IDocument[]>(subscriber => {
            this.flexSearch.search({
                query,
                field: "text",
                limit,
                suggest: true
            }, (result : IDocument[]) => {
                subscriber.next(result);
                subscriber.complete();
            });
        }).pipe(
            flatMap(results => {
                console.log(results);
                return fromArray(results);
            }),
            map(result => result.text)
        );
    }

}
