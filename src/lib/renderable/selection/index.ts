import {IRenderable, IRenderer, ISpecification, IStackeable} from '../../api';
import Renderables from '../Renderables';
import EventStream from "../../event/EventStream";
import {EventType} from "../../event/EventType";
import {MessageType} from "../../support/MessageType";

/**
 * Implementation of the 'selection' markup element.
 * A HTML div element is used to create a selection containing multiple 'selectionItem' elements.
 * Only one 'selectionItem' is visible.
 * The user can either click on the left or right side of the visible 'selectionItem' to select one of the two options.
 * If the click happened, the next 'selectionItem' will be showed.
 * For CSS manipulations the following classes are added:
 *  lto-selection: the container
 *  lto-selection-left: click to choose the left option
 *  lto-selection-right: click to choose the right option
 *  lto-animation-left: is set when clicking lto-selection-left
 *  lto-animation-right: is set when clicking lto-selection-right
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */
export class Selection implements IRenderable, IStackeable {

    private readonly selection: HTMLElement;
    private readonly spec: ISpecification;
    private readonly numOfBlocks: number;
    private values: Array<any> = [];
    private isPublished: boolean = false;
    private animationDuration = 300;

    constructor(message: ISpecification) {
        this.spec = message;
        this.numOfBlocks = this.spec.elements!.length;
        this.selection = document.createElement('div');
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        const position = this.spec.position || 'left';
        this.selection.setAttribute("name", this.spec.name || "");
        this.selection.classList.add('lto-selection', "lto-" + position);

        if (this.spec.id !== undefined) {
            this.selection.id = this.spec.id;
        }
        if (this.spec.class !== undefined)
            this.spec.class.split(" ").forEach(e => this.selection.classList.add(e));

        let publishedBlocks: number = 0;
        const elements = (this.spec.elements || []).map(e => renderer.render(e, this));

        elements.forEach(e => e.forEach(items => {
            const left = document.createElement("div");
            const right = document.createElement("div");
            items.style.userSelect = "none";
            left.className = "lto-selection-left";
            right.className = "lto-selection-right";
            items.appendChild(left);
            items.appendChild(right);
            this.selection.appendChild(items);
        }));

        this.selection.querySelectorAll(".lto-selection-item").forEach(items => {
            items.addEventListener("click", ev => {
                //@ts-ignore
                if (ev.target.getAttribute("class") === "lto-selection-left") {
                    items.classList.add("lto-animate-left");
                    this.values.push({[items.getAttribute("name") || ""]: "left"});
                } else {
                    items.classList.add("lto-animate-right");
                    this.values.push({[items.getAttribute("name") || ""]: "right"});
                }
                setTimeout(() => (items as HTMLElement).style.display = "none", this.animationDuration);

                if (++publishedBlocks === this.numOfBlocks) {
                    // wait till animation is finished
                    setTimeout(() => {
                        this.setFinished();
                        this.publish();
                    }, this.animationDuration);
                }
            })
        });

        if (isNested) {
            this.selection.classList.add('lto-nested');
        }

        if (this.spec.countdownInSec !== 0) {
            setTimeout(() => {
                this.setFinished();
                this.publish()
            }, this.spec.countdownInSec as number * 1000);
        }

        return this.selection;
    }

    public publish(): void {
        if (!this.isPublished) {
            this.selection.style.pointerEvents = "none";
            const evType = EventType.withChannelId(EventType.PUBLISH, this.spec.channelId);

            // Workaround since a map with contains a map which contains an array of maps (this.values)
            // cannot be serialized. This also removes the need to reduceToMap in the onComplete of
            // the prompt
            // Take the array of maps (selection items and choice) and convert it to single map
            // Contained in a map that has as key the selection form name
            const selectionMap = {};
            selectionMap[this.spec.name!!] = {};
            for (const selectionItemAndChoice of this.values) {
                selectionMap[this.spec.name!!][Object.keys(selectionItemAndChoice)[0]] =
                    selectionItemAndChoice[Object.keys(selectionItemAndChoice)[0]];
            }

            const payload = {
                type: MessageType.SUBMIT,
                attributes: {
                    name: this.spec.name,
                    value: JSON.stringify(selectionMap)
                },
                payload: {
                    text: this.spec.name, // Used to be this.spec.text, which is undefined
                    value: JSON.stringify(selectionMap)
                }
            };

            EventStream.emit(evType, payload);

            this.isPublished = true;
        }
    }

    private setFinished() {
        this.selection.classList.add("lto-selection-finished");
    }
}

Renderables.register("selection", Selection);
