import {IRenderable, IRenderer, ISpecification, IStackeable} from '../../api';
import {AbstractDecorator} from "./AbstractDecorator";
import {Defaults} from "../../support/Defaults";
import {IIntentProvider} from "./autocomplete/IIntentProvider";
import {filter} from "rxjs/operators";
import {IIndex} from "./autocomplete/index/IIndex";
import {FlexSearchIndex} from "./autocomplete/index/FlexSearchIndex";


/**
 * The autocomplete decorator adds an autocomplete mechanism
 * for the user input.
 */
export class AutocompleteDecorator extends AbstractDecorator {

    private readonly index: IIndex;
    private readonly intentProvider: IIntentProvider;

    constructor(renderer: IRenderer, intentProvider: IIntentProvider, txt?: HTMLTextAreaElement) {
        super(renderer);
        this.intentProvider = intentProvider;
        this.index = new FlexSearchIndex();
        this.loadAutocompletionItems();
        (txt || Defaults.textbox()).addEventListener("keyup", this.onKeydown.bind(this));
    }

    private loadAutocompletionItems() {
        this.intentProvider.getAllIntentUtterances()
            .pipe(
                filter(utterance => true) // TODO: Check if intent should appear in autocompletion
            ).subscribe(utterance => this.index.add(utterance));


    }


    private onKeydown(event: KeyboardEvent) {
        // TODO: check if printable character was typed - otherwise ignore
        if (event.key.length === 1
            || event.key in ["Spacebar", "Decimal", "Multiply", "Add", "Subtract", "Divide"]
            || /[^a-zA-Z0-9]+/.test(event.key)) {

            console.log("Searching for " + Defaults.textbox().value);
            this.index.search(Defaults.textbox().value).subscribe(result => console.log("Result: " + result));


        }

        // TODO: implement autocomplete with flexsearch (https://github.com/nextapps-de/flexsearch)
    }

    /**
     * @inheritDoc
     */
    render(renderable: ISpecification | IRenderable, containerType?: IStackeable): HTMLElement[] {
        const result = super.render(renderable, containerType);
        // TODO: add autocomplete value list

        return result;
    }

}




