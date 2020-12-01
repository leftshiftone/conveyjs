import {IRenderable, IRenderer, ISpecification, IStackeable} from "../../api";

export abstract class AbstractDecorator implements IRenderer {

    private readonly renderer: IRenderer;
    protected channelId?: string;

    protected constructor(renderer: IRenderer) {
        this.renderer = renderer;
    }

    appendContent(element: HTMLElement): void {
        this.renderer.appendContent(element);
    }

    appendSuggest(element: HTMLElement): void {
        this.renderer.appendSuggest(element);
    }

    init(channelId?: string): void {
        this.renderer.init(channelId);
        this.channelId = channelId;
    }

    render(message: ISpecification | IRenderable, containerType?: IStackeable): HTMLElement[] {
        return this.renderer.render(message, containerType);
    }

}
