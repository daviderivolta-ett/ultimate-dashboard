import * as d3 from 'd3';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="line-chart"></div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    #line-chart {
        position: absolute;
        pointer-events: none;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }
    `
    ;

// Component
export default class LineChart extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _resizeObserver: ResizeObserver;
    private _yUnit: string = '';
    private _xUnit: string = '';

    public data: number[][] = [
        [34, 78],
        [109, 280],
        [310, 120],
        [105, 411],
        [420, 220],
        [233, 145],
        [333, 96],
        [222, 333],
        [78, 320],
        [21, 123],
        [210, 500]
    ];

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        this._resizeObserver = new ResizeObserver(() => this._drawChart());
    }

    public get xUnit(): string { return this._xUnit }
    public set xUnit(value: string) {
        this._xUnit = value;
        this._drawChart();
    }

    public get yUnit(): string { return this._yUnit }
    public set yUnit(value: string) {
        this._yUnit = value;
        this._drawChart();
    }

    // Component callbacks
    public connectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.observe(container);
    }

    static observedAttributes: string[] = ['x-unit', 'y-unit'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'x-unit') this.xUnit = newValue;
        if (name === 'y-unit') this.yUnit = newValue;
    }

    public disconnectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.unobserve(container);
    }

    // Methods
    private _drawChart(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (!container) return;

        container.innerHTML = '';

        const currentWidth: number = this._getContainerSize('line-chart', 'width');
        const currentHeight: number = this._getContainerSize('line-chart', 'height');

        const padding: number = 48;

        this._sortDataset(this.data);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (d: number[]) => d[0] ?? 0)!])
            .range([padding, currentWidth - padding])

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (d: number[]) => d[1] ?? 0)!])
            .range([currentHeight - padding, padding])

        const line = d3.line<number[]>()
            .curve(d3.curveCardinal)
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]))

        const svg = d3.select(this.shadowRoot.querySelector('#line-chart'))
            .append('svg')
            .attr('width', currentWidth)
            .attr('height', currentHeight)

        // x axis
        const xAxis = svg.append('g')
            .attr('transform', 'translate(0,' + (currentHeight - padding) + ')')
            .call(d3.axisBottom(xScale).ticks(currentWidth / 50))

        xAxis.selectAll('text')
            .style('font-size', '.6rem')
            .style('font-family', 'Inter')

        xAxis.selectAll('.tick')
            .filter((d, i) => i === 0)
            .style('display', 'none')

        xAxis.selectAll('.tick')
            .filter((d, i, nodes) => i === nodes.length - 1)
            .remove();

        xAxis.selectAll('.tick')
            .select('line')
            .style('display', 'none')

        xAxis.select('.domain')
            .style('display', 'none')

        // y axis
        const yAxis = svg.append('g')
            .attr('transform', 'translate(' + padding + ', 0)')
            .call(d3.axisLeft(yScale).ticks(currentWidth / 50))

        yAxis.selectAll('text')
            .style('font-size', '.6rem')
            .style('font-family', 'Inter')

        yAxis.selectAll('.tick')
            .filter((d, i, nodes) => i === nodes.length - 1)
            .remove();

        yAxis.selectAll('.tick')
            .select('line')
            .style('display', 'none')

        yAxis.select('.domain')
            .style('display', 'none')

        // x uom
        svg.append('text')
            .attr('class', 'x-unit')
            .attr('x', currentWidth - padding - 10)
            .attr('y', currentHeight - padding + 15)
            .style('font-size', '.6rem')
            .style('text-anchor', 'start')
            .text(this.xUnit)

        // y uom
        svg.append('text')
            .attr('class', 'y-unit')
            .attr('x', padding / 2)
            .attr('y', padding)
            .style('font-size', '.6rem')
            .style('text-anchor', 'start')
            .text(this.yUnit)

        // horizontal grid
        svg.append('g')
            .attr('class', 'grid')
            .selectAll('line')
            .data(yScale.ticks())
            .join('line')
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('x1', padding)
            .attr('x2', currentWidth - padding)
            .attr('stroke', 'var(--chart-line-color)')

        // line
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#894CEB')
            .attr('stroke-width', 2)
            .attr('d', line(this.data));
    }

    private _getContainerSize(id: string, size: string): number {
        if (!d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size)) return 0;
        return parseInt(d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size), 10);
    }

    private _sortDataset(data: number[][]): number[][] {
        return data.sort((a: number[], b: number[]) => a[0] - b[0]);
    }
}

customElements.define('ettdash-line-chart', LineChart);