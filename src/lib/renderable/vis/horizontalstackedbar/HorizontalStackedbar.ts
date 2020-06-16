import * as d3 from "d3";
import HorizontalStackedbarOptions from './HorizontalStackedbarOptions';
import {getDigit, getLetter} from '../../../support/Strings';

export default class HorizontalStackedbar {

    private readonly options: HorizontalStackedbarOptions;
    private readonly idMap: Map<string, number> = new Map<string, number>();
    private xAxis?: d3.ScaleLinear<number, number>;
    private yAxis?: d3.ScaleBand<string>;
    private margin = {top: 0, right: 0, bottom: 0, left: 0};


    constructor(options: HorizontalStackedbarOptions = new HorizontalStackedbarOptions()) {
        this.options = options;
    }

    public render() {
        const div = document.createElement("div");
        div.classList.add("lto-vis-stackedbar");
        div.innerHTML = `<svg viewBox="0 0 ${this.options.width} ${this.options.height}"></svg>`;

        if (this.options.showAxis) {
            this.margin.right = 20;
            this.margin.left = 40;
            this.margin.bottom = 40;
        }
        if (this.options.showLegend) {
            this.margin.top = this.options.height * 0.35;
        }
        return div;
    }

    public init(element: HTMLElement) {
        this.options.data.then(data => {
            const svg = d3.select(element.querySelector("svg"));
            const width = this.options.width - this.margin.left - this.margin.right;
            const height = this.options.height - this.margin.top - this.margin.bottom;
            const g = svg.append("g");

            this.xAxis = d3.scaleLinear().rangeRound([this.margin.left, width + this.margin.left]);
            this.yAxis = d3.scaleBand().rangeRound([height + this.margin.top, 0]).padding(0.0).align(0.1);

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
                    x: this.getValues(columns, e.data, "values")[columns.indexOf(layer.key)],
                    y: i,
                    column: layer.key,
                    barLabels: this.getValues(columns, e.data, "barLabels")[columns.indexOf(layer.key)],
                };
            }));
            for (let s = 0; s < numStates; ++s) {
                let x0 = 0;
                for (let ag = 0; ag < columns.length; ++ag) {
                    const e = layers[ag][s];
                    e.x0 = x0;
                    x0 += e.x;
                }
            }

            /*
             * Calculate the maximum of the total populations,
             * and the maximum of the age groups.
             */
            // const yGroupMax = d3.max(layers, (layer: any) => d3.max(layer, (d: any) => d.y));
            const xStackMax = parseFloat(d3.max(layers, (layer: any) => d3.max(layer, (d: any) => d.x0 + d.x)) as string);
            /*
             * Set the domains for the x-, y-axis and categorical color scales.
             */
            this.yAxis!!.domain(data.map((d: any) => d.type));
            // @ts-ignore
            this.xAxis.domain([0, d3.max(data, (d: any) => this.sumup(d))]).nice();


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
                .attr("x", 0)
                .attr("y", (d: any) => this.yAxis!!(d.type) as number)
                .attr("width", 0)
                .attr("height", this.yAxis!!.bandwidth());
            rect = g.selectAll("rect");
            // Animation to gradually "grow" the bars from the y-axis.
            rect.transition()
                .delay((d, i) => i)
                .attr("x", (d: any) => this.xAxis!!(d.x0))
                .attr("width", (d: any) => this.getBarWidth(d))
                .attr("class", (d: any) => d.column);

            // bar tooltips
            rect.append("svg:title")
                .text((d: any) => d.column + ": " + d.x);

            // render bar labels
            g.selectAll(".serie")
                .append("text")
                .attr("class", "axis axis--x")
                .attr("text-anchor", "middle")
                .attr("x", (d: any) => this.xAxis!!(d[0].x0) + (this.getBarWidth(d[0]) / 2))
                .attr("y", this.yAxis!!.bandwidth() / 2)
                .attr("alignment-baseline", "middle")
                .text((d: any) => d[0].barLabels)
                .style('fill', 'white');

            if (this.options.showAxis) {
                this.renderAxis(g, svg, width, height);
            }
            if (this.options.showLegend) {
                const transition = this.transitionStacked(g, xStackMax);
                transition.on("end", () => this.renderLegend(g, columns));
            }
        });
    }

    private renderAxis(g: d3.Selection<any, any, any, any>, svg: d3.Selection<SVGSVGElement | null, {}, null, undefined>, width: number, height: number) {
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height + this.margin.top) + ")")
            .call(d3.axisBottom(this.xAxis!!));

        // Labels
        svg.append("text")
            .attr("class", "axis axis--x")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + ((width / 2) + this.margin.left) + "," + (height + this.margin.top + 35) + ")")
            .text(this.options.textY);
        svg.append("text")
            .attr("class", "axis axis--y")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(0," + ((height / 2) + this.margin.top) + ")rotate(-90)")
            .attr("dy", "20.0")
            .text(this.options.textX);
    }

    private getBarWidth(d: any): number {
        return Math.abs(this.xAxis!!(d.x + d.x0) - this.xAxis!!(d.x0));
    }

    private getBarHeight(): number {
        return this.yAxis!!.bandwidth() - this.margin.top;
    }

    private renderLegend(g: d3.Selection<any, any, any, any>, columns: Array<string>) {
        const elementsPerRow = 3;
        const elementWidth = (this.options.width - this.margin.left) / elementsPerRow;
        const legend = g.selectAll(".legend")
            .data(columns)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(" + (((i % elementsPerRow) * elementWidth) + this.margin.left) + ", " + (Math.floor(i / elementsPerRow) * 20) + ")");
        const rectSize = 0.036 * this.options.width;
        legend.append("rect")
            .attr("x", 0)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("class", (d: any) => `serie lto-vis-${getDigit(this.idMap, d)} lto-vis-${getLetter(this.idMap, d)}`);
        legend.append("circle")
            .attr("cx", rectSize / 2)
            .attr("cy", rectSize / 2)
            .attr("r", rectSize / 2)
            .attr("class", (d: any) => `serie lto-vis-${getDigit(this.idMap, d)} lto-vis-${getLetter(this.idMap, d)}`);
        legend.append("text")
            .attr("x", rectSize * 1.12)
            .attr("y", rectSize / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text((d: any) => d);
    }

    private renderBarLabels(g: d3.Selection<any, any, any, any>, xStackMax: number) {
        g.selectAll(".serie").selectAll("text")
            .transition()
            .duration(500)
            .attr("y", (d: any) => this.margin.top + (this.yAxis!!(d[0].type) as number) + (this.getBarHeight() / 2))
            .attr("x", (d: any) => this.xAxis!!(d[0].x0) + (this.getBarWidth(d[0]) / 2))
            .attr("class", (d: any) => d[0].x / xStackMax < 0.1 ? "lower-10-pct" : "higher-10-pct"
            );
    }


    /*
     * Reset the domain for the x-axis scaling to maximum of the x axis totals,
     * transition the y-axis changes to the bar heights, and then transition the
     * x-axis changes to the bar widths.
     */
    private transitionStacked(g: d3.Selection<any, any, any, any>, xStackMax: number): d3.Transition<any, any, any, any> {
        this.xAxis!!.domain([0, xStackMax]);
        return g.selectAll("rect").transition()
            .duration(500)
            .delay((d: any, i: any) => i)
            .attr("x", (d: any) => this.xAxis!!(d.x0))
            .attr("width", (d: any) => this.xAxis!!(d.x + d.x0) - this.xAxis!!(d.x0))
            .transition()
            .call(() => this.renderBarLabels(g, xStackMax))
            .attr("y", (d: any) => {
                return this.margin.top + (this.yAxis!!(d.type) as number);
            })
            .attr("height", this.getBarHeight());
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

    private getValues(labels: Array<string>, data: any, fieldName: string) {
        const values: Array<number> = Array.from({length: labels.length}, () => 0);
        data.labels.forEach((key: string) => {
            const index = labels.indexOf(key);
            values[labels.indexOf(key)] = data[fieldName].length > index ? data[fieldName][index] : 0;
        });
        return values;
    }
}
