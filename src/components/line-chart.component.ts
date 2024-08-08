import * as d3 from 'd3';

export type LineChartDataset = {
    label: string,
    dataset: number[][]
}

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="line-chart"></div>
    <div class="legend"></div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }

    #line-chart {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }

    .legend {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .legend__item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 8px 0 0;
    }

    .legend__item {
        gap: 8px;
    }

    .legend__item__rect {
        width: 24px;
        height: 3px;
    }

    .legend__item__label {
        font-size: .8rem;
    }
    `
    ;

// Component
export default class LineChart extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _resizeObserver: ResizeObserver;
    private _showLegend: boolean = false;
    private _yUnit: string = '';
    private _xUnit: string = '';

    private _data: LineChartDataset[] = [
        {
            label: 'Example label',
            dataset: [
                [10, 20],
                [20, 35],
                [30, 25],
                [40, 50],
                [50, 60],
                [60, 45],
                [70, 70],
                [80, 55],
                [90, 80],
                [100, 90]
            ]
        },
        {
            label: 'Pippo',
            dataset: [
                [10, 30],
                [20, 45],
                [30, 35],
                [40, 60],
                [50, 70]
            ]
        },
        {
            label: 'Topolino',
            dataset: [
                [80, 45],
                [40, 65],
                [100, 70],
                [70, 70],
                [30, 50]
            ]
        }
    ]

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        this._resizeObserver = new ResizeObserver(() => this._drawChart());
    }

    public get showLegend(): boolean { return this._showLegend }
    public set showLegend(value: boolean) {
        this._showLegend = value;
        this._drawLegend();
        this._drawChart();
    }

    public get xUnit(): string { return this._xUnit }
    public set xUnit(value: string) {
        this._xUnit = value;
        this._drawLegend();
        this._drawChart();
    }

    public get yUnit(): string { return this._yUnit }
    public set yUnit(value: string) {
        this._yUnit = value;
        this._drawLegend();
        this._drawChart();
    }

    public get data(): LineChartDataset[] { return this._data }
    public set data(value: LineChartDataset[]) {
        this._data = value;
        this._drawLegend();
        this._drawChart();
    }

    // Component callbacks
    public connectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.observe(container);
    }

    static observedAttributes: string[] = ['x-unit', 'y-unit', 'show-legend'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'x-unit') this.xUnit = newValue;
        if (name === 'y-unit') this.yUnit = newValue;
        if (name === 'show-legend' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.showLegend = true : this.showLegend = false;
        }
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

        // chart
        const currentWidth: number = this._getContainerSize('line-chart', 'width');
        const currentHeight: number = this._getContainerSize('line-chart', 'height');
        const padding: number = 24;

        this._sortDatasets(this.data);

        // scale
        const data: number[][] = this.data.flatMap((d: LineChartDataset) => d.dataset);

        const xScale = d3.scaleLinear()
            .domain([d3.min(data, (d: number[]) => d[0] ?? 0)!, d3.max(data, (d: number[]) => d[0] ?? 0)!])
            .range([padding, currentWidth - padding])

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: number[]) => d[1] ?? 0)!])
            .range([currentHeight - padding, padding])

        // svg
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
            .style('text-anchor', 'middle')
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

        const colorScale: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);
        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = colorScale(i.toString());

            // area
            // svg.append('path')
            //     .datum(dataset.dataset)
            //     .attr('fill', color)
            //     .attr('fill-opacity', '.4')
            //     .attr('stroke', 'none')
            //     .attr('d', d3.area<number[]>()
            //         .curve(d3.curveCardinal)
            //         .x(d => xScale(d[0]))
            //         .y0(currentHeight - padding)
            //         .y1(d => yScale(d[1]))
            //     );

            // line
            const line = d3.line<number[]>()
                .curve(d3.curveCardinal)
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]));

            svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('d', line(dataset.dataset));

            // points
            const points = svg.append('g')
                .attr('class', 'points-group')
                .selectAll('points')
                .data(dataset.dataset)
                .enter()
                .append('circle')
                .attr('fill', color)
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
                    d3.select('#d3-tooltip')
                        .style('opacity', 0)
                        .style('display', 'none')
                })

            // tooltip
            if (!document.querySelector('#d3-tooltip')) {
                d3.select('body')
                    .append('div')
                    .attr('id', 'd3-tooltip')
                    .attr('style', 'position: absolute; opacity: 0; display: none; background-color: white; padding: 8px; border-radius: 4px; max-width: 200px')
            }
        });
    }

    private _getContainerSize(id: string, size: string): number {
        if (!d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size)) return 0;
        return parseInt(d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size), 10);
    }

    private _sortDatasets(data: LineChartDataset[]): LineChartDataset[] {
        return data.map(dataset => {
            dataset.dataset.sort((a, b) => a[0] - b[0]);
            return dataset;
        });
    }

    private _drawLegend(): void {
        const legend: HTMLDivElement | null = this.shadowRoot.querySelector('.legend');
        if (legend) legend.innerHTML = '';

        const colorScale: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);

        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = colorScale(i.toString());
            if (this.showLegend) {
                if (legend && legend.childNodes.length < this.data.length) {
                    const item: HTMLDivElement = this._drawLegendItem(color, dataset.label);
                    legend.appendChild(item);
                }
            }
        })
    }

    private _drawLegendItem(color: string, labelText: string): HTMLDivElement {
        const container: HTMLDivElement = document.createElement('div');
        container.classList.add('legend__item');

        const rect: HTMLDivElement = document.createElement('div');
        rect.classList.add('legend__item__rect');
        rect.style.backgroundColor = color;
        container.appendChild(rect);

        const label: HTMLSpanElement = document.createElement('span');
        label.classList.add('legend__item__label');
        label.innerText = labelText;
        container.appendChild(label);

        return container;
    }
}

customElements.define('ettdash-line-chart', LineChart);