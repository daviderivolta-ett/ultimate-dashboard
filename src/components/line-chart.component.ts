import * as d3 from 'd3';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="line-chart"></div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    #line-chart {
        height: 100%;
        width: 100%;
    }

    .grid {
        stroke: gray;
        stroke-opacity: 0.2;
        stroke-dasharray: 5;
    }
    `
    ;

interface DataPoint {
    x: number;
    y: number;
}

export default class LineChart extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private resizeObserver: ResizeObserver;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        this.resizeObserver = new ResizeObserver(() => this._drawChart());
    }

    public connectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this.resizeObserver.observe(container);
    }

    public disconnectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this.resizeObserver.unobserve(container);
    }

    private _drawChart(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (!container) return;

        container.innerHTML = '';

        const currentWidth: number = this._getContainerSize('line-chart', 'width');
        const currentHeight: number = this._getContainerSize('line-chart', 'height');

        const margin = { top: 24, right: 24, bottom: 24, left: 24 };
        const width = currentWidth - margin.left - margin.right;
        const height = currentHeight - margin.top - margin.bottom;

        const data: DataPoint[] = [
            { x: 1, y: 3 },
            { x: 2, y: 7 },
            { x: 3, y: 5 },
            { x: 4, y: 10 },
            { x: 5, y: 8 },
            { x: 6, y: 12 },
            { x: 7, y: 15 },
            { x: 8, y: 14 },
            { x: 9, y: 18 },
            { x: 10, y: 20 },
        ];

        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const valueline = d3.line<DataPoint>()
            .curve(d3.curveCardinal)
            .x(d => x(d.x))
            .y(d => y(d.y));

        const svg = d3.select(this.shadowRoot.querySelector('#line-chart'))
            .append("svg")
            .attr("width", currentWidth)
            .attr("height", currentHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        x.domain(d3.extent(data, d => d.x) as [number, number]);
        y.domain([0, d3.max(data, d => d.y)] as [number, number]);

        svg.append("path")
            .data([data])
            .attr('fill', 'none')
            .attr('stroke', '#894CEB')
            .attr('stroke-width', 2)
            .attr("d", valueline);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // svg.append("g")
        //     .attr("class", "y axis")
        //     .call(d3.axisLeft(y));

        function make_y_gridlines() {
            return d3.axisLeft(y).ticks(5);
        }

        svg.append('g')
            .attr('class', 'grid')
            .call(make_y_gridlines().tickSize(-currentWidth + margin.left + margin.right).tickFormat(null))

    }

    private _getContainerSize(id: string, size: string): number {
        return parseInt(d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size), 10);
    }
}

customElements.define('line-chart', LineChart);