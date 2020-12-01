import {AutocompleteDropdown} from "../AutocompleteDropdown";

describe("AutocompleteDropdown", () => {
    it("updating elements changes the displayed elements", () => {
        const container = document.createElement("div");
        const dropdown = new AutocompleteDropdown(container, () => {
        });

        // Per default 0 dropdown elements are displayed
        let dropdownItems = container.querySelectorAll(".dropdown-item");
        expect(dropdownItems.length).toEqual(0);

        // When updated all 3 elements are displayed
        dropdown.updateElements(["1", "2", "3"]);
        dropdownItems = container.querySelectorAll(".dropdown-item");
        expect(dropdownItems.length).toEqual(3);

        // When updated only the new elements remain
        dropdown.updateElements(["4", "5"]);
        dropdownItems = container.querySelectorAll(".dropdown-item");
        expect(dropdownItems.length).toEqual(2);
        expect((dropdownItems.item(0) as HTMLDivElement).innerText).toEqual("4");
        expect((dropdownItems.item(1) as HTMLDivElement).innerText).toEqual("5");

        // When updated with an empty list all old elements are gone
        dropdown.updateElements([]);
        dropdownItems = container.querySelectorAll(".dropdown-item");
        expect(dropdownItems.length).toEqual(0);
    });

    it("click listeners are registered and unregistered", () => {
        const container = document.createElement("div");
        const clickedElements: string[] = [];
        const clickCallback = (event: Event) => clickedElements.push((event.currentTarget as HTMLElement).innerText);
        const dropdown = new AutocompleteDropdown(container, clickCallback);
        dropdown.updateElements(["1", "2", "3"]);

        // When clicked the clickCallback is executed with the corresponding elements
        let dropdownItems = container.querySelectorAll(".dropdown-item");
        (dropdownItems.item(2) as HTMLDivElement).click();
        (dropdownItems.item(2) as HTMLDivElement).click();
        (dropdownItems.item(1) as HTMLDivElement).click();
        expect(clickedElements).toEqual(["3", "3", "2"]);

        // When the elements are updated, old click listeners are unregistered
        dropdown.updateElements(["4", "5"]);
        (dropdownItems.item(1) as HTMLDivElement).click();
        expect(clickedElements).toEqual(["3", "3", "2"]);

        // When unbind is called, all elements are removed and click listeners unregistered
        dropdownItems = container.querySelectorAll(".dropdown-item");
        dropdown.unbind();
        (dropdownItems.item(1) as HTMLDivElement).click();
        expect(clickedElements).toEqual(["3", "3", "2"]);
        expect(container.querySelectorAll(".dropdown-item").length).toEqual(0);
    });
});
