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
        display: flex;
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
        [50, 78],
        [109, 280],
        [310, 120],
        [105, 411],
        [420, 220],
        [233, 145],
        [333, 96],
        [222, 333],
        [150, 320],
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

        const padding: number = 24;

        this._sortDataset(this.data);

        const xScale = d3.scaleLinear()
            .domain([d3.min(this.data, (d: number[]) => d[0] ?? 0)!, d3.max(this.data, (d: number[]) => d[0] ?? 0)!])
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

        // xAxis.selectAll('.tick')
        //     .select('line')
        //     .style('display', 'none')

        // xAxis.select('.domain')
        //     .style('display', 'none')

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
            .attr('x', currentWidth - padding)
            .attr('y', currentHeight - padding + 15)
            .style('font-size', '.6rem')
            .style('text-anchor', 'end')
            .text(this.xUnit)

        // y uom
        svg.append('text')
            .attr('class', 'y-unit')
            .attr('x', padding - 4)
            .attr('y', padding)
            .style('font-size', '.6rem')
            .style('text-anchor', 'end')
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

        // area
        svg.append('path')
            .datum(this.data)
            .attr('fill', 'var(--data-purple-color)')
            .attr('fill-opacity', '.4')
            .attr('stroke', 'none')
            .attr('d', d3.area<number[]>()
                .curve(d3.curveCardinal)
                .x(d => xScale(d[0]))
                .y0(currentHeight - padding)
                .y1(d => yScale(d[1]))
            );

        // line
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'var(--data-purple-color)')
            .attr('stroke-width', 2)
            .attr('d', line(this.data));

        // points        
        svg.selectAll('points')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('fill', 'var(--data-purple-color)')
            .attr('stroke', 'none')
            .attr('cx', d => xScale(d[0]))
            .attr('cy', d => yScale(d[1]))
            .attr('r', 3)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select('#d3-tooltip')
                    .transition().duration(200)
                    .style('opacity', 1)
                    .style('display', 'block')
                    .style('left', event.pageX + 8 + 'px')
                    .style('top', event.pageY + 8 + 'px')
                    .text(`${this.xUnit}: ${d[0]}, ${this.yUnit}: ${d[1]}`)
            })
            .on('mouseout', function () {
                d3.select('#d3-tooltip').style('opacity', 0)
            })

        // tooltip
        if (!document.querySelector('#d3-tooltip')) {
            d3.select('body')
                .append('div')
                .attr('id', 'd3-tooltip')
                .attr('style', 'position: absolute; opacity: 0; display: none; background-color: white; padding: 8px; border-radius: 4px; max-width: 200px')
        }
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