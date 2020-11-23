import {Observable} from "rxjs";

export interface IIndex {
    add(element: string): void;

    search(query: string): Observable<string>;
}

