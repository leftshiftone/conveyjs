import {IRenderer, IRenderable, ISpecification, IStackeable} from "../api";

interface RendererByChannelId {
    [channelId: string]: IRenderer;
}

export class MultiTargetRenderer implements IRenderer {

    public renderers: RendererByChannelId = {};

    constructor(renderers: RendererByChannelId) {
        this.renderers = renderers;
    }

    init() {
        Object.keys(this.renderers).forEach(channelId => {
            const renderer = this.resolve(channelId);
            if (renderer) {
                (renderer as IRenderer).init(channelId);
            }
        });
    }

    private resolve(channelId: string) {
        const renderer = this.renderers[channelId];
        if (renderer) {
            return renderer;
        }
        console.error(`No renderer registered for channelId ${channelId}`);
        return null;
    }

    appendContent(element: HTMLElement, channelId?: string): void {
        const renderer = this.resolve(channelId!);
        if (renderer) renderer.appendContent(element);
    }

    appendSuggest(element: HTMLElement, channelId?: string): void {
        const renderer = this.resolve(channelId!);
        if (renderer) renderer.appendSuggest(element);
    }

    render(message: ISpecification | IRenderable, containerType?: IStackeable): HTMLElement[] {
        const channelId = (message as ISpecification).channelId;
        const renderer = this.resolve(channelId!);
        return renderer ? renderer.render(message, containerType) : [];
    }

}
