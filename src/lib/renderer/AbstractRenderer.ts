import Renderables from '../renderable/Renderables';
import {IRenderer, ISpecification, IRenderable, IStackeable} from '../api';

/**
 * Abstract renderer class.
 */
export abstract class AbstractRenderer implements IRenderer {

    protected readonly content: HTMLElement;
    protected readonly suggest: HTMLElement;
    public clientId : null | string = null;

    constructor(content: HTMLElement, suggest: HTMLElement) {
        this.content = content;
        this.suggest = suggest;
    }

    abstract initListeners(): void;

    public setClientId(clientId: string): void {
        this.clientId = clientId;
        this.initListeners();
    }

    /**
     * @inheritDoc
     */
    public render(message: ISpecification | IRenderable, containerType?: IStackeable): HTMLElement[] {
        const spec = Object.assign(message, {clientId: this.clientId, interactionContentClassName: this.content.className});
        if (message["render"] !== undefined) {
            return this.renderElement(spec as IRenderable, containerType);
        }
        const renderable = this.getRenderable(spec as ISpecification);
        return this.renderElement(renderable, containerType);
    }

    /**
     * Renders an incoming {@link IRenderable}
     */
    protected abstract renderElement(element: IRenderable, containerType?: IStackeable): HTMLElement[];

    // noinspection JSMethodCanBeStatic
    /**
     * Returns the html decoded message
     *
     * @param text to be decoded message
     */
    private decodeEntities(text: string) {
        const handler = document.createElement('div');

        handler.innerHTML = text
            .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
            .replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');

        return handler.textContent || "";
    }

    /**
     * Returns the element by evaluating the message type.
     *
     * @param message the message
     */
    // noinspection JSMethodCanBeStatic
    private getRenderable(message: ISpecification): IRenderable {
        if (message.text) {
            message.text = this.decodeEntities(message.text);
        }

        const renderableClass = Renderables.resolve(message.type.toUpperCase());
        if (renderableClass === undefined) {
            console.error(`unable to render element of type "${message.type}"`);
        }
        return new renderableClass(message) as IRenderable;
    }

    /**
     * @inheritDoc
     */
    public appendContent = (element: HTMLElement) => {
        this.content.appendChild(element);
    }

    /**
     * @inheritDoc
     */
    public appendSuggest = (element: HTMLElement) => {
        this.suggest.appendChild(element);
    }

}
