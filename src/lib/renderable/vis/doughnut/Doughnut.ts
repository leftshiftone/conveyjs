// noinspection TsLint
import * as d3 from "d3";
import DoughnutOptions from './DoughnutOptions';

/**
 * Implementation of the 'doughnut' markup element.
 */
export class Doughnut {

    private readonly options: DoughnutOptions;
    private readonly radius: number;

    constructor(options: DoughnutOptions = new DoughnutOptions()) {
        this.options = options;
        this.radius = Math.min(options.width, options.height) / 2;
    }

    /**
     * @inheritDoc
     */
    public render(): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("lto-vis-doughnut");
        const width = this.options.width + 200;
        div.innerHTML = `<svg viewBox="-${width / 2} -${this.options.height / 2} ${width} ${this.options.height}"/>`;
        return div;
    }

    public init(element: HTMLElement) {
        const svg = d3.select(element.querySelector("svg")).append("g");
        svg.append("g").attr("class", "lto-vis-slices");
        svg.append("g").attr("class", "lto-vis-labels");
        svg.append("g").attr("class", "lto-vis-lines");
        this.options.data.then(e => this.change(e, svg, element));
    }

    private getLetter(index: number) {
        return String.fromCharCode('A'.charCodeAt(0) + (index % 5));
    }

    private change(data: any, svg: any, element: HTMLElement) {
        const arc = d3.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * this.options.doughnutRatio);
        const outerArc = d3.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);

        const pie = d3.pie().sort(null).value((d: any) => d.value);
        const key = (d: any) => d.data.label;
        const slice = svg.select(".lto-vis-slices").selectAll("path.lto-vis-slice").data(pie(data), key);

        if (this.options.iconUrl) {
            const width = this.radius * (this.options.doughnutRatio) * Math.sqrt(2);
            svg.select("g")
                .append("image")
                .attr("xlink:href", this.options.iconUrl)
                .attr("width", width)
                .attr("height", width)
                .attr("x", -width / 2)
                .attr("y", -width / 2);
        }

        let _current: any;
        slice.enter()
            .insert("path")
            .attr("class", (d: any, index: number) => `lto-vis-${index} lto-vis-${this.getLetter(index)}`)
            .merge(slice)
            .transition().duration(1000)
            .attrTween("d", (d: any) => {
                _current = _current || d;
                const interpolate = d3.interpolate(_current, d);
                _current = interpolate(0);
                return (t: any) => arc(interpolate(t)) as string;
            });

        slice.exit().remove();
        const $this = this;

        const text = svg.select(".lto-vis-labels").selectAll("text").data(pie(data), key);

        const midAngle = (d: any) => d.startAngle + (d.endAngle - d.startAngle) / 2;

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text((d: any) => d.data.label)
            .merge(text)
            .transition().duration(1000)
            .attrTween("transform", (d: any) => {
                _current = _current || d;
                const interpolate = d3.interpolate(_current, d);
                _current = interpolate(0);
                return function (t: any) {
                    const d2 = interpolate(t);
                    const pos = outerArc.centroid(d2);
                    pos[0] = $this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", (d: any) => {
                _current = _current || d;
                const interpolate = d3.interpolate(_current, d);
                _current = interpolate(0);
                return function (t: any) {
                    const d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            });

        text.exit().remove();

        const polyline = svg.select(".lto-vis-lines").selectAll("polyline").data(pie(data), key);

        polyline.enter()
            .append("polyline")
            .attr("class", (d: any, index: number) => `lto-vis-${index} lto-vis-${this.getLetter(index)}`)
            .merge(polyline)
            .transition().duration(1000)
            .attrTween("points", (d: any) => {
                _current = _current || d;
                const interpolate = d3.interpolate(_current, d);
                _current = interpolate(0);
                return function (t: any) {
                    const d2 = interpolate(t);
                    const pos = outerArc.centroid(d2);
                    pos[0] = $this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit().remove();

        setTimeout(() => {
            const registry = {};
            element.querySelectorAll(".lto-vis-labels text").forEach(text => {
                const x = Math.floor((text as SVGTextElement).transform.animVal.getItem(0).matrix.e);
                const y = Math.floor((text as SVGTextElement).transform.animVal.getItem(0).matrix.f);

                if (registry[x + ":" + y] === undefined) {
                    registry[x + ":" + y] = 1;
                } else {
                    const amount = registry[x + ":" + y];
                    text.setAttribute("dy", (amount * 20) + "px");
                    registry[x + ":" + y] = registry[x + ":" + y] + 1;
                }
            });
        }, 1200);

    }

}
