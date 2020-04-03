import {IRenderable, IRenderer, ISpecification, IStackeable} from '../../api';
import EventStream from '../../event/EventStream';
import {EventType} from "../../event/EventType";

enum Direction {
    Previous,
    Next
}

/**
 * Implementation of the Bootstrap 4 Carousel
 *
 * @see {@link IRenderable}
 * @see {@link IStackeable}
 */

export default class BootstrapCarousel implements IRenderable, IStackeable {

    public spec: ISpecification;

    private readonly carousel: HTMLDivElement;
    private readonly carouselInner: HTMLDivElement;
    private readonly carouselIndicator: HTMLOListElement;

    constructor(message: ISpecification) {
        this.spec = message;

        this.carousel = document.createElement('div');
        this.carouselInner = document.createElement('div');
        this.carouselIndicator = document.createElement('ol');
    }

    /**
     * @inheritDoc
     */
    public render(renderer: IRenderer, isNested: boolean): HTMLElement {
        this.carousel.classList.add('carousel', 'slide');
        this.carousel.setAttribute('data-ride', 'carousel');
        this.carousel.setAttribute('data-interval', 'false');
        this.carousel.id = 'ltoBootstrapCarousel';
        this.carouselInner.classList.add('carousel-inner');
        this.carouselIndicator.classList.add('carousel-indicators');

        if (this.spec.id !== undefined) {
            this.carousel.id = this.spec.id;
        }
        if (this.spec.class !== undefined) {
            this.spec.class.split(" ").forEach(e => this.carousel.classList.add(e));
        }

        let idx = 0;
        (this.spec.elements || []).map((e) => {
            renderer.render(e, this).forEach(x => {
                x.classList.add('carousel-item');
                if (idx === 0) {
                    x.classList.add('active');
                }

                this.carouselInner.appendChild(x);
                this.carouselIndicator.appendChild(this.getIndicator(idx));
                idx++;
            });
        });

        EventStream.emit(EventType.CAROUSEL, this.current());

        this.carousel.appendChild(this.carouselIndicator);
        this.carousel.appendChild(this.carouselInner);

        this.carousel.appendChild(this.getNavigation(Direction.Previous));
        this.carousel.appendChild(this.getNavigation(Direction.Next));

        return this.carousel;
    }

    private getIndicator(idx: number) {
        const indicator = document.createElement('li');
        !idx && indicator.classList.add('active');

        indicator.setAttribute('data-target', '#ltoBootstrapCarousel');
        indicator.setAttribute('data-slide-to', idx.toString());

        return indicator;
    }

    private getNavigation(direction: Direction) {
        const navItem = document.createElement('a');

        navItem.classList.add(direction ? 'carousel-control-prev' : 'carousel-control-next');
        navItem.href = '#ltoBootstrapCarousel';
        navItem.setAttribute('role', 'button');
        navItem.setAttribute('data-slide', direction ? 'prev' : 'next');

        const navIcon = document.createElement('span');
        navIcon.classList.add(direction ? 'carousel-control-prev-icon' : 'carousel-control-next-icon');
        navIcon.setAttribute('aria-hidden', 'true');

        const navText = document.createElement('span');
        navText.classList.add('sr-only');
        navText.innerText = direction ? 'Previous' : 'Next';
        navItem.appendChild(navIcon);
        navItem.appendChild(navText);

        return navItem;
    }

    private current() {
        let current = 0;
        let counter = 0;

        this.carouselInner.childNodes.forEach(item => {
            if ((item as HTMLElement).classList.contains('active')) {
                current = counter;
            }
            counter++;
        });

        return current;
    }
}
