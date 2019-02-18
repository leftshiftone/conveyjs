import "./Sunburst.scss";
// noinspection TsLint
// noinspection TsLint
import * as d3 from "d3";
import {Arc, PartitionLayout} from "d3";
import {HtmlSelection} from '../D3Support';
import SunburstOptions from './SunburstOptions';

/**
 * Implementation of the 'sunburst' vis markup element.
 */
export class Sunburst {

    private options: SunburstOptions;
    private radius: number;
    private totalSize: number = 0;

    private color:d3.ScaleOrdinal<any, any>;

    constructor(options: SunburstOptions = new SunburstOptions()) {
        this.options = options;
        this.radius = Math.min(options.width, options.height - 50) / 2;
        this.color = d3.scaleOrdinal().range(options.color);
    }

    public render(): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("lto-vis-sunburst");
        div.innerHTML = `
        <div>
            <div id="chart">
                <section id="legend" />
            </div>
        </div>`;
        // const explanation = div.querySelector("#explanation") as HTMLDivElement;
        // explanation.style.visibility = "hidden";
        // explanation.style.left = (this.radius - 20) + "px";
        // explanation.style.top = (this.radius - 20) + "px";
        return div;
    }

    public init(element:HTMLElement) {
        this.options.data.then(data => {
            const vis = d3.select(element.querySelector("#chart")).append("svg:svg")
                .attr("width", this.options.width)
                .attr("height", this.options.height - 20)
                .append("svg:g")
                .attr("id", "container")
                .attr("transform", "translate(" + this.options.width / 2 + "," + (this.options.height - 20) / 2 + ")");

            const partition = d3.partition().size([2 * Math.PI, this.radius * this.radius]);

            const arc = d3.arc()
                .startAngle((d: any) => d.x0)
                .endAngle((d: any) => d.x1)
                .innerRadius((d: any) => Math.sqrt(d.y0))
                .outerRadius((d: any) => Math.sqrt(d.y1));

            // @ts-ignore
            this.createVisualization(data, vis, partition, arc, element);
        });
    }

    private createVisualization(json: any, vis: HtmlSelection, partition: PartitionLayout<{}>, arc: Arc<any, any>, element:HTMLElement) {
        this.initializeBreadcrumbTrail(element);
        this.drawLegend();

        // Bounding circle underneath the sunburst, to make it easier to detect when the mouse leaves the parent g.
        vis.append("svg:circle").attr("r", this.radius).style("opacity", 0);

        const root = d3.hierarchy(json)
            .sum((d) => d.size)
            .sort((a: any, b: any) => b.value - a.value);

        const nodes = partition(root).descendants().filter((d) => (d.x1 - d.x0 > 0.005));

        const path = vis.data([json]).selectAll("path")
            .data(nodes)
            .enter().append("svg:path")
            .attr("display", (d) => d.depth ? null : "none")
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", (d: any) => this.color(d.data.name) as string)
            .style("opacity", 1)
            .on("mouseover", (d) => this.mouseover(d, vis, this.totalSize, element));

        d3.select("#container").on("mouseleave", (d) => this.mouseleave(d, vis, element));
        this.totalSize = path.datum().value as number;
    }

    private initializeBreadcrumbTrail(element:HTMLElement) {
        const trail = d3.select(element.querySelector("#legend")).append("svg:svg")
            .attr("width", this.options.width)
            .attr("height", 20)
            .attr("id", "trail");
        trail.append("svg:text")
            .attr("id", "endlabel")
            .style("fill", "#000");
    }

    private mouseleave(d: any, vis: HtmlSelection, element:HTMLElement) {
        d3.select(".lto-vis-sunburst #trail").style("visibility", "hidden");

        // d3.selectAll(".lto-vis-sunburst path").on("mouseover", null);
        d3.selectAll(".lto-vis-sunburst path")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .on("end", () => {
                // vis.selectAll("path").on("mouseover", (x: any) => this.mouseover(x, vis, this.totalSize, element));
            });
        // d3.select("#explanation").style("visibility", "hidden");
    }

    private mouseover(d: any, vis: HtmlSelection, totalSize: number, element:HTMLElement) {
        const percentage = parseFloat((100 * d.value / totalSize).toPrecision(3));
        const percentageString = (percentage < 0.1) ? "< 0.1%" : percentage + "%";

        const sequenceArray = d.ancestors().reverse();
        sequenceArray.shift(); // remove root node from the array
        this.updateBreadcrumbs(sequenceArray, percentageString, element);

        d3.selectAll(".lto-vis-sunburst #chart > svg path").style("opacity", 0.3);
        vis.selectAll("path")
            .filter((node) => (sequenceArray.indexOf(node) >= 0))
            .style("opacity", 1);
    }

    private breadcrumbPoints(d: any, i: any) {
        const points = [];
        points.push("0,0");
        points.push(this.options.b.w + ",0");
        points.push(this.options.b.w + this.options.b.t + "," + (this.options.b.h / 2));
        points.push(this.options.b.w + "," + this.options.b.h);
        points.push("0," + this.options.b.h);
        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
            points.push(this.options.b.t + "," + (this.options.b.h / 2));
        }
        return points.join(" ");
    }

    private updateBreadcrumbs(nodeArray: any, percentageString: string, element:HTMLElement) {
        const trail = d3.select(element.querySelector("#trail"))
            .selectAll("g")
            .data(nodeArray, (d: any) => d.data.name + d.depth);

        trail.exit().remove();

        const entering = trail.enter().append("svg:g");
        entering.append("svg:polygon")
            .attr("points", this.breadcrumbPoints.bind(this))
            .style("fill", (d: any) => this.color(d.data.name) as string);

        entering.append("svg:text")
            .attr("x", (this.options.b.w + this.options.b.t) / 2)
            .attr("y", this.options.b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text((d: any) => this.options.mapText(d.data.name));

        entering.merge(trail).attr("transform", (d: any, i: any) => "translate(" + i * (this.options.b.w + this.options.b.s) + ", 0)");
        d3.select(element.querySelector("#trail")).select("#endlabel")
            .attr("x", (nodeArray.length + 0.5) * (this.options.b.w + this.options.b.s))
            .attr("y", this.options.b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(percentageString);

        d3.select(".lto-vis-sunburst #trail").style("visibility", "");
    }

    private drawLegend() {
        if (this.options.legend) {
            const legend = d3.select("#legend").append("svg:svg")
                .attr("width", d3.keys(this.color).length * (this.options.b.w + this.options.b.s))
                .attr("height", this.options.b.h);
            const g = legend.selectAll("g")
                .data(d3.entries(this.color))
                .enter().append("svg:g")
                .attr("transform", (d: any, i: any) => "translate(" + i * (this.options.b.w + this.options.b.s) + ", 0)");

            g.append("svg:rect")
                .attr("rx", this.options.b.r)
                .attr("ry", this.options.b.r)
                .attr("width", this.options.b.w)
                .attr("height", this.options.b.h)
                .style("fill", (d: any) => d.value);
            g.append("svg:text")
                .attr("x", this.options.b.w / 2)
                .attr("y", this.options.b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text((d: any) => d.key);
        }
    }

}
