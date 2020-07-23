import {ChoiceAggregator} from "../ChoiceAggregator";
import {Form, ISpecification} from "../../../../std";
import {ClassicRenderer} from "../../../renderer/ClassicRenderer";
import {InputContainer} from "../../../support/InputContainer";

describe("ChoiceAggregatorTest", () => {

    it("sieves input elements", () => {


        const containerGenerator = function* () {
            yield {
                dataset: {name: "first", sieve: "true"},
                querySelectorAll: (selector: string) => {
                    if (selector === "input[type='checkbox']") {
                        return [
                            {dataset: {name: "some element", type: "checkbox"}, checked: true},
                            {dataset: {name: "another element", type: "checkbox"}, checked: true},
                            {dataset: {name: "yet another element", type: "checkbox"}, checked: false},
                        ];
                    }
                    return [];
                }
            };
            yield {
                dataset: {name: "second", sieve: "false"},
                querySelectorAll: (selector: string) => {
                    if (selector === "input[type='checkbox']") {
                        return [
                            {dataset: {name: "a radio button", type: "radio"}, checked: false},
                            {dataset: {name: "another radio button", type: "radio"}, checked: true}
                        ];
                    }
                    return [];
                }
            };
        };

        const gen = containerGenerator();
        //@ts-ignore
        const result = ChoiceAggregator.aggregate({
            forEach: (cb) => {
                // @ts-ignore
                cb(gen.next().value);
                // @ts-ignore
                cb(gen.next().value);
            }
        });

        expect(result.attributes["first"]).not.toBeUndefined();
        expect(result.attributes["first"].length).toBe(2);
        // contains only true values
        expect(result.attributes["first"].reduce((acc: boolean, val: any) => acc && val.value, true)).toBe(true);
        expect(result.attributes["second"]).not.toBeUndefined();
        expect(result.attributes["second"].length).toBe(2);
        // contains only false values
        expect(result.attributes["second"].reduce((acc: boolean, val: any) => acc && val.value, true)).toBe(false);
    });

    let mock: HTMLElement;

    beforeEach(() => {
        mock = document.createElement("div");
    });

    const expectedRejected = "not allowed";

    const singleChoiceFactory = (elements: number, options?: any) => {
        const spec: ISpecification = {type: "form", name: "form", elements: []};
        for (let i = 0; i < elements; ++i) {
            let choice = {
                type: "singlechoice", name: `singlechoice${i + 1}`, sieve: true, elements: [
                    {type: 'radioChoice', name: `option${i * 2 + 1}`},
                    {type: 'radioChoice', name: `option${i * 2 + 2}`},
                ]
            };
            if (options && options[`element${i}`]) {
                choice = {...choice, ...options[`element${i}`]};
            }
            spec.elements!.push(choice);
        }

        spec.elements!.push({
            type: "submit", name: "submit", text: "submit"
        });

        return new Form(spec);
    };

    const multiChoiceFactory = (elements: number, options?: any) => {
        const spec: ISpecification = {type: "form", name: "form", elements: []};
        for (let i = 0; i < elements; ++i) {
            let choice = {
                type: "multiplechoice", name: `multichoice${i + 1}`, sieve: true, elements: [
                    {type: 'checkBoxChoice', name: `option${i * 2 + 1}`},
                    {type: 'checkBoxChoice', name: `option${i * 2 + 2}`},
                ]
            };
            if (options && options[`element${i}`]) {
                choice = {...choice, ...options[`element${i}`]};
            }
            spec.elements!.push(choice);
        }

        spec.elements!.push({
            type: "submit", name: "submit", text: "submit"
        });

        return new Form(spec);
    };

    const checkOption = (num: number | number[], form: HTMLElement) => {
        const elements = Array.isArray(num) ? num : [num];
        elements.forEach(e => {
            const option = form.querySelector(`[value="option${e}"]`) as HTMLInputElement;
            option.checked = true;
        });
    };

    it("1 required singlechoice, missing input", async () => {

        const form = singleChoiceFactory(1, {element0: {required: true}})
            .render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("1 required singlechoice, option1 selected", async () => {

        const expectedResult = {form: [[{singlechoice1: [{name: "option1", value: true}]}]]};

        const form = singleChoiceFactory(1, {element0: {required: true}})
            .render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(1, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expectedResult);
    });

    it("2 required singlechoice elements, no option selected", async () => {

        const form = singleChoiceFactory(2, {
            element0: {required: true},
            element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("2 required singlechoice elements, only 1 option selected", async () => {

        const form = singleChoiceFactory(2, {
            element0: {required: true},
            element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(1, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("2 required singlechoice elements, 2 options selected", async () => {

        const expected = {
            form: [[{
                singlechoice1: [{
                    name: "option2",
                    value: true
                }]
            }, {
                singlechoice2: [{
                    name: "option4",
                    value: true
                }]
            }]]
        };

        const form = singleChoiceFactory(2, {
            element0: {required: true},
            element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption([2, 4], form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("1 required singlechoice and 1 non-required singlechoice elements, 1 options selected", async () => {

        const expected = {
            form: [[{
                singlechoice2: [{
                    name: "option4",
                    value: true
                }]
            }]]
        };

        const form = singleChoiceFactory(2, {
            element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(4, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("1 required singlechoice and 1 non-required singlechoice elements, 1 non-required options selected", async () => {

        const form = singleChoiceFactory(2, {
            element0: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(4, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("2 non-required singlechoice elements, 0 options selected", async () => {

        const expected = {form: [[]]};

        const form = singleChoiceFactory(2).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("2 non-required singlechoice elements, 2 options selected", async () => {

        const expected = {
            form: [[{
                singlechoice1: [{
                    name: "option1",
                    value: true
                }]
            }, {
                singlechoice2: [{
                    name: "option3",
                    value: true
                }]
            }]]
        };

        const form = singleChoiceFactory(2).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption([1, 3], form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("1 required multichoice, 2 options selected", async () => {

        const expected = {
            form: [[{
                multichoice1: [{
                    name: "option1",
                    value: true,
                }, {
                    name: "option2",
                    value: true,
                }]
            }]]
        };

        const form = multiChoiceFactory(1, {element0: {required: true}})
            .render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption([1, 2], form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("1 required multichoice, 0 options selected", async () => {

        const form = multiChoiceFactory(1, {element0: {required: true}})
            .render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("2 required multichoice, 1 options selected", async () => {

        const form = multiChoiceFactory(2, {
            element0: {required: true}, element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(3, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("2 required multichoice, 3 options selected", async () => {

        const expected = {
            form: [[{
                multichoice1: [{
                    name: "option2",
                    value: true,
                }]
            }, {
                multichoice2: [{
                    name: "option3",
                    value: true,
                }, {
                    name: "option4",
                    value: true,
                }]
            }
            ]]
        };

        const form = multiChoiceFactory(2, {
            element0: {required: true}, element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption([2, 3, 4], form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });

    it("1 required multichoice, 1 non-required, 2 non-required options selected", async () => {

        const form = multiChoiceFactory(2, {
            element0: {required: false}, element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption([1, 2], form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).rejects.toEqual(expectedRejected);
    });

    it("1 required multichoice, 1 non-required, 1 required option selected", async () => {

        const expected = {
            form: [[{
                multichoice2: [{
                    name: "option4",
                    value: true,
                }]
            }
            ]]
        };

        const form = multiChoiceFactory(2, {
            element0: {required: false}, element1: {required: true}
        }).render(new ClassicRenderer(mock, mock), false);

        const submit = form.querySelector('.lto-submit') as HTMLButtonElement;
        checkOption(4, form);

        await expect(InputContainer.getAll(form as HTMLFormElement, submit)).resolves.toEqual(expected);
    });
});
