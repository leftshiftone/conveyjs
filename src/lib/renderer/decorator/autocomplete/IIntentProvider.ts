import {Observable} from "rxjs";

export interface IIntentProvider {
    getAllIntentUtterances(language?: string): Observable<string>;
}
