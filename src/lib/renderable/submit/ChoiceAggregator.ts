/**
 * Aggregates and transforms <input> elements in the given scope (determined by the passed {@link ChoiceContainer} Element)
 * to {@link ChoiceResult} objects.
 *
 * If the choice container is marked with the data attribute data-sieve non checked inputs are filtered
 * @see {@link ChoiceResult#filter}
 *
 * The return object has the following structure:
 *  { "someName" : [
 *      {"name": "first", "checked": true},
 *      {"name": "second", "checked": false}
 *  ]}
 *
 *  If multiple containers share the same name the array containing the {@link ChoiceResult} objects is overwritten.
 */
import {SubmitState} from "./SubmitState";
import {ChoiceAggregationResult} from "./ChoiceAggregationResult";

export class ChoiceAggregator {

    /**
     * Returns an {@link ChoiceAggregationResult} containing the permission to be submitted and the attributes.
     *
     * @param choiceContainers
     */
    public static aggregate(choiceContainers: NodeListOf<Element>): ChoiceAggregationResult {
        const choices = {};
        let allowed = true;
        choiceContainers.forEach((container) => {
            const name = (container as HTMLElement).dataset.name;
            const required = JSON.parse((container as HTMLElement).dataset.required || "false");
            if (name === undefined) {
                throw new Error("name is undefined");
            }
            this.addToContainer(name, this.toChoiceResults(container, "input[type='checkbox']"), choices);
            this.addToContainer(name, this.toChoiceResults(container, "input[type='radio']"), choices);
            if (required && !Object.keys(choices).find(choice => choice === name)) allowed = false;
        });

        return {state: allowed ? SubmitState.ALLOWED: SubmitState.SUBMIT_REQUIRED_ERROR, attributes: choices as Attr};
    }

    private static addToContainer(name: string, items: ChoiceResult[], container: any): void {
        if (items.length > 0) {
            if (container[name] !== undefined) {
                console.info(`duplicated name: ${name} - multiple container share the same name => results overwritten.`);
            }
            container[name] = items;
        }
    }

    /**
     * Transforms items matching the given selector to an array of {@link ChoiceResult} and filters
     * based on the sieve data attribute
     * @see {@link ChoiceAggregator#filter}
     * @param container
     * @param selector
     */
    private static toChoiceResults(container: Element, selector: string): ChoiceResult[] {
        return this.querySelectorAll(container, selector)
            .filter(this.filter(container))
            .map(e => new ChoiceResult((e as HTMLElement).dataset.name || "", (e as HTMLInputElement).checked));
    }

    /**
     * Returns a filter that either filters 'unchecked' input elements or not depending on
     * the sieve data attribute
     * @param container the choice container element {@link ChoiceContainer}
     */
    private static filter(container: Element): (e: Element) => boolean {
        if ((container as HTMLElement).dataset.sieve === "true") {
            return (e: Element) => (e as HTMLInputElement).checked;
        }
        return (e: Element) => true;
    }

    /**
     * Transforms a {@link NodeListOf<Element>} to an array of {@link Element}
     * @param element
     * @param selector
     */
    private static querySelectorAll(element: Element, selector: string): Element[] {
        return [].slice.call(element.querySelectorAll(selector));
    }
}

/**
 * Tuple that represents a choice result by its name and its boolean value
 */
class ChoiceResult {
    readonly name: string;
    readonly value: boolean;

    constructor(name: string, value: boolean) {
        this.name = name;
        this.value = value;
    }
}
