import * as d3 from "d3";
import {BaseType, ScaleBand, ScaleLinear} from "d3";
import HorizontalStackedbarOptions from './HorizontalStackedbarOptions';
import {getDigit, getLetter} from '../../../support/Strings';

class AxisDetail<T> {
    readonly axis: T;
    readonly name: "x" | "y";
    readonly dim: "width" | "height";

    constructor(axis: T, name: "x" | "y", dim: "width" | "height") {
        this.axis = axis;
        this.name = name;
        this.dim = dim;
    }
}

export default class HorizontalStackedbar {

    private readonly options: HorizontalStackedbarOptions;
    private readonly idMap: Map<string, number> = new Map<string, number>();
    private linear?: AxisDetail<d3.ScaleLinear<number, number>>;
    private band?: AxisDetail<d3.ScaleBand<string>>;

    constructor(options: HorizontalStackedbarOptions = new HorizontalStackedbarOptions()) {
        this.options = options;
    }

    public render() {
        const div = document.createElement("div");
        div.classList.add("lto-vis-stackedbar");
        div.innerHTML = `<svg width=${this.options.width} height=${this.options.height}></svg>`;

        return div;
    }

    private initAxis(width: number, height: number) {
        if (this.options.horizontal) {
            this.linear = new AxisDetail(d3.scaleLinear().rangeRound([0, width]), "x", "width");
            this.band = new AxisDetail(d3.scaleBand().rangeRound([height, 0]).padding(0.0).align(0.1), "y", "height");
        } else {
            this.linear = new AxisDetail(d3.scaleLinear().rangeRound([height, 0]), "y", "height");
            this.band = new AxisDetail(d3.scaleBand().rangeRound([0, width]).padding(0.1).align(0.1), "x", "width");
        }
    }

    public init(element: HTMLElement) {
        this.options.data.then(data => {
            const svg = d3.select(element.querySelector("svg"));
            const margin = {top: 20, right: 20, bottom: 50, left: 40};
            const width = +svg.attr("width") - margin.left - margin.right;
            const height = +svg.attr("height") - margin.top - margin.bottom;
            const g = svg.append("g");

            this.initAxis(width, height);
            let layers;
            let rect;

            if (this.options.sort) {
                data.sort((a: any, b: any) => b.total - a.total);
            }

            const columns: Array<string> = this.getLabels(data);
            const numStates = data.length;
            const stack = d3.stack().keys(columns);

            layers = stack(data).map((layer: any) => layer.map((e: any, i: any) => {
                return {
                    type: e.data.type,
                    [this.linear!!.name]: this.getValues(columns, e.data)[columns.indexOf(layer.key)],
                    [this.band!!.name]: i,
                    column: layer.key
                };
            }));
            for (let s = 0; s < numStates; ++s) {
                let x0 = 0;
                for (let ag = 0; ag < columns.length; ++ag) {
                    const e = layers[ag][s];
                    e["linear0"] = x0;
                    x0 += e[this.linear!!.name];
                }
            }

            /*
             * Calculate the maximum of the total populations,
             * and the maximum of the age groups.
             */
            // const yGroupMax = d3.max(layers, (layer: any) => d3.max(layer, (d: any) => d.y));
            const xStackMax = d3.max(layers, (layer: any) => d3.max(layer, (d: any) => d["linear0"] + d[this.linear!!.name]));
            /*
             * Set the domains for the x-, y-axis and categorical color scales.
             */
            this.band!!.axis.domain(data.map((d: any) => d.type));
            // @ts-ignore
            this.linear.axis.domain([0, d3.max(data, (d: any) => this.sumup(d))]).nice();


            /*
             * Render intial state of bars
             */
            g.selectAll(".serie")
                .data(layers)
                .enter().append("g")
                .attr("class", (d: any) => `serie lto-vis-${getDigit(this.idMap, d[0].column)} lto-vis-${getLetter(this.idMap, d[0].column)}`)
                .selectAll("rect")
                .data((d: any) => d)
                .enter().append("rect")
                .attr(this.linear!!.name, 0)
                .attr(this.band!!.name, (d: any) => this.band!!.axis(d.type) as number)
                .attr(this.linear!!.dim, 0)
                .attr(this.band!!.dim, this.band!!.axis.bandwidth());
            rect = g.selectAll("rect");
            // Animation to gradually "grow" the bars from the x-axis.
            rect.transition()
                .delay((d, i) => i)
                .attr(this.linear!!.name, (d: any) => this.linear!!.axis(d.linear0))
                .attr(this.linear!!.dim, (d: any) => this.linear!!.axis(d[this.linear!!.name] + d.linear0) - this.linear!!.axis(d.linear0))
                .attr("class", (d: any) => d.column);

            // add svg title for tooltip support
            rect.append("svg:title")
                .text((d: any) => d.type + ", " + d.column + ": " + d[this.linear!!.name]);
            /*
             * X-axis set-up.
             * Note that we do not set up the Y-axis, since the bar heights are
             * scaled dynamically.
             */
            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(this.linear!!.axis));

            // Add labels to the axes.
            svg.append("text")
                .attr("class", "axis axis--x")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width / 2) + "," + (height + 60) + ")")
                .text(this.options.textX);
            svg.append("text")
                .attr("class", "axis axis--y")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(0," + (height / 2) + ")rotate(-90)")
                .attr("dy", "20.0")
                .text(this.options.textY);

            if (this.options.legend) {
                const transition = this.transitionStacked(this.linear!!.axis, this.band!!.axis, rect, parseFloat(xStackMax as string));
                transition.on("end", () => this.renderLegend(g, columns));
            }
        });
    }


    private renderLegend(g: d3.Selection<any, any, any, any>, columns: Array<string>) {
        const legend = g.selectAll(".legend")
            .data(columns.reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(" + ((i % 4) * 100) + ", " + (Math.floor(i / 4) * 20) + ")");
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("class", (d: any) => `serie lto-vis-${getDigit(this.idMap, d)} lto-vis-${getLetter(this.idMap, d)}`);
        legend.append("text")
            .attr("x", 20)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text((d: any) => d);
    }

    /*
     * Reset the domain for the y-axis scaling to maximum of the population totals,
     * transition the y-axis changes to the bar heights, and then transition the
     * x-axis changes to the bar widths.
     */

    private transitionStacked(x: ScaleLinear<number, number>, y: ScaleBand<string>,
                              rect: d3.Selection<BaseType, any, any, any>, xStackMax: number): d3.Transition<any, any, any, any> {
        this.linear!!.axis.domain([0, xStackMax]);
        return rect.transition()
            .duration(500)
            .delay((d: any, i: any) => i)
            .attr(this.linear!!.name, (d: any) => this.linear!!.axis(d.linear0))
            .attr(this.linear!!.dim, (d: any) => this.linear!!.axis(d[this.linear!!.name] + d.linear0) - this.linear!!.axis(d.linear0))
            .transition()
            .attr(this.band!!.name, (d: any) => {
                const margin = this.options.legend ? 40 : 0;
                return margin + (this.band!!.axis(d.type) as number);
            })
            .attr(this.band!!.dim, this.band!!.axis.bandwidth() * 0.85);
    }

    private sumup(data: any) {
        return data.values.reduce((sum: number, val: number) => sum + val, 0);
    }

    private getLabels(data: [any]): Array<string> {
        const labels: Array<string> = [];
        data.forEach(e => {
            e.labels.forEach((key: string) => {
                if (key !== "type") {
                    if (labels.indexOf(key) < 0) {
                        labels.push(key);
                    }
                }
            });
        });
        return labels;
    }

    private getValues(labels: Array<string>, data: any) {
        const values: Array<number> = Array.from({length: labels.length}, () => 0);
        data.labels.forEach((key: string) => {
            const index = labels.indexOf(key);
            values[labels.indexOf(key)] = data.values.length > index ? data.values[index] : 0;
        });
        return values;
    }

}
