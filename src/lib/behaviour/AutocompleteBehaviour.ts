import {Defaults} from "../support/Defaults";
import {IIndex, IBehaviour} from "../api";
import {FlexSearchIndex} from "./autocomplete/index/FlexSearchIndex";
import {AutocompleteDropdown} from "./autocomplete/AutocompleteDropdown";
import {Subscription} from "../connection/Subscription";

/**
 * Configuration for enabling Autocompletion for the text input field.
 *
 * @member {HTMLDivElement} dropdownElement is used as container to render the autocompletion dropdown.
 * Per default the first element with class lto-autocomplete is used.
 * @member {HTMLButtonElement} invokerElement is clicked when an autocomplete suggestion is clicked.
 * @member {number} maxNumberOfResults is used to determine the max elements displayed in the autocomplete dropdown.
 * Default is 5.
 * @member {IIndex} index is used to store and search for autocompletion elements.
 */
interface AutocompleteConfig {
    dropdownElement?: HTMLDivElement;
    invokerElement?: HTMLButtonElement;
    maxNumberOfResults?: number;
    index?: IIndex;
}

/**
 * The autocomplete behaviour adds an autocomplete mechanism
 * for the user input. The possible autocomplete entries
 * need to be added via add method.
 */
export class AutocompleteBehaviour extends IBehaviour {
    private readonly index: IIndex;
    private readonly autocompleteDropdown: AutocompleteDropdown;
    private readonly maxNumberOfResults: number;

    constructor(config: AutocompleteConfig, textbox: HTMLTextAreaElement = Defaults.textbox()) {
        super(textbox, [
            {type: "input", handler: () => this.onKeydown(textbox)}
        ]);
        this.index = config.index || new FlexSearchIndex();
        this.maxNumberOfResults = config.maxNumberOfResults || 5;
        this.autocompleteDropdown = new AutocompleteDropdown(config.dropdownElement || Defaults.autocomplete(), (event: Event) => {
            textbox.value = (event.currentTarget as HTMLElement).innerText;
            (config.invokerElement || Defaults.invoker()).click();
        });
    }

    public add(element: string) {
        this.index.add(element);
    }

    public clear() {
        this.index.clear();
    }

    bind(gateway: Subscription) {
        super.bind(gateway);
        this.autocompleteDropdown.bind();
    }

    unbind() {
        super.unbind();
        this.autocompleteDropdown.unbind();
        this.clear();
    }

    private onKeydown(textbox: HTMLTextAreaElement) {
        if (textbox.value.length > 0) {
            this.index.search(textbox.value, this.maxNumberOfResults)
                .then(elements => this.autocompleteDropdown.updateElements(elements));
        } else {
            this.autocompleteDropdown.updateElements([]);
        }
    }
}




