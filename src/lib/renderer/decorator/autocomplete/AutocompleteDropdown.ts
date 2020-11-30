import node from "../../../support/node";

export class AutocompleteDropdown {
    readonly dropdownElement: HTMLDivElement;
    readonly onClickCallback: (event: Event) => void;
    changeDropDirectionTimeout: any;

    constructor(dropdownElement: HTMLDivElement, onClickCallback: (event: Event) => void) {
        this.dropdownElement = dropdownElement;
        this.onClickCallback = onClickCallback;
    }

    public bind() {
        window.addEventListener("resize", this.onResize.bind(this));
    }

    public unbind() {
        window.removeEventListener("resize", this.onResize.bind(this));
        this.clearElements();
    }

    public updateElements(elements: string[]) {
        this.clearElements();
        if (elements.length > 0) {
            elements.forEach(element => {
                const elementNode = node("div").addClasses("dropdown-item").innerText(element).unwrap();
                elementNode.addEventListener("click", this.onClickCallback.bind(this));
                this.dropdownElement.appendChild(elementNode);
            });
            this.toggleDropDirection();
        }
    }

    private onResize() {
        clearTimeout(this.changeDropDirectionTimeout);
        this.changeDropDirectionTimeout = setTimeout(this.toggleDropDirection.bind(this), 100);
    }

    private clearElements() {
        this.dropdownElement.childNodes.forEach(node => node.removeEventListener("click", this.onClickCallback.bind(this)));
        this.dropdownElement.innerHTML = "";
    }

    private toggleDropDirection() {
        this.dropdownElement.classList.remove("lto-dropdirection-up");
        this.dropdownElement.classList.add("lto-dropdirection-down");

        const windowHeight = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

        if (this.dropdownElement.getBoundingClientRect().bottom > windowHeight) {
            this.dropdownElement.classList.remove("lto-dropdirection-down");
            this.dropdownElement.classList.add("lto-dropdirection-up");
        }
    }
}
