import {EMPTY, from, Observable} from "rxjs";
import {Gaia, GaiaRef, UsernamePasswordCredentials} from "@leftshiftone/gaia-sdk/dist";
import {flatMap} from "rxjs/internal/operators";
import {expand, filter, map, toArray} from "rxjs/operators";
import {fromArray} from "rxjs/internal/observable/fromArray";
import {Intent} from "@leftshiftone/gaia-sdk/dist/graphql/response/type/Intent";
import {IIntentProvider} from "./IIntentProvider";

export class IntentProvider implements IIntentProvider {
    readonly gaiaRef: Observable<GaiaRef>;
    readonly identityId: string;

    constructor(identity: string) {
        this.gaiaRef = from(Gaia.login("http://localhost:8080", new UsernamePasswordCredentials("admin", "admin")));
        this.identityId = identity;
    }

    public getAllIntentUtterances(language: string = "de"): Observable<string> {
        return this.gaiaRef.pipe(
            flatMap(
                ref => this.retrieveAllIntents(ref)
            ),
            map(intent => intent["utterance"] || {}),
            filter(utterances => utterances[language] instanceof Array && utterances[language].length > 0),
            flatMap(utterances => fromArray(utterances[language] as Array<string>))
        );
    }

    private retrieveAllIntents(gaiaRef: GaiaRef, pageSize: Number = 25): Observable<Intent> {
        return this.retrieveIntentPage(gaiaRef, pageSize, 0).pipe(
            expand(page => {
                if (page.entities.length < pageSize) {
                    return EMPTY;
                }
                return this.retrieveIntentPage(gaiaRef, pageSize, page.offset.valueOf() + pageSize.valueOf());
            }, 1),
            flatMap(page => fromArray(page.entities)));
    }

    private retrieveIntentPage(gaiaRef: GaiaRef, pageSize: Number, offset: Number): Observable<EntityPage<Intent>> {
        return gaiaRef.retrieveIntents(this.identityId, x => {
            x.utterance();
        }, pageSize, offset)
            .pipe(
                toArray(),
                map((entities: Array<Intent>) => {
                        return {entities, offset};
                    }
                ));
    }
}

interface EntityPage<T> {
    entities: T[];
    offset: Number;
}
