import * as d3 from 'd3';

export type LineChartDataset = {
    label: string,
    dataset: number[][]
}

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="line-chart">
        <div class="header">
            <slot name="title"></slot>
            <slot name="desc"></slot>
        </div>
        <div id="line-chart"></div>
        <div class="legend"></div>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .line-chart {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
    }

    .line-chart.line-chart--minimal {
        padding: 16px;
    }

    slot[name="desc"].header__desc--hidden,
    slot[name="title"].header__title--hidden  {
        display: none;
    }

    slot[name="title"] {
        display: block;
        color: var(--fg-color-default);
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 .5rem 0;
    }

    slot[name="desc"] {
        display: block;
        color: var(--fg-color-muted);
        font-size: .85rem;
    }

    #line-chart {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }

    .legend {
        display: flex;
        align-items: center;
        justify-content: center;
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

    .legend__item__circle {
        width: 8px;
        height: 8px;
        border-radius: 100%;
    }

    .legend__item__label {
        font-size: .8rem;
    }
    `
    ;

// Component
export default class LineChartComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _resizeObserver: ResizeObserver;
    private _colors: string[] = [
        'var(--data-blue-color)',
        'var(--data-purple-color)',
        'var(--data-turquoise-color)',
        'var(--data-mint-green-color)',
        'var(--data-coral-color)',
        'var(--data-pastel-pink-color)',
        'var(--data-sun-yellow-color)',
        'var(--data-light-grey-color)',
        'var(--data-aquamarine-color)',
        'var(--data-fire-red-color)',
        'var(--data-lime-green-color)',
        'var(--data-lavender-color)'
    ];


    private _isMinimal: boolean = false;
    private _showLegend: boolean = false;
    private _showTitle: boolean = false;
    private _showDesc: boolean = false;
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
        // {
        //     label: 'Pippo',
        //     dataset: [
        //         [10, 30],
        //         [20, 45],
        //         [30, 35],
        //         [40, 60],
        //         [50, 70]
        //     ]
        // },
        // {
        //     label: 'Topolino',
        //     dataset: [
        //         [80, 45],
        //         [40, 65],
        //         [100, 70],
        //         [70, 70],
        //         [30, 50]
        //     ]
        // }
    ]

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        this._resizeObserver = new ResizeObserver(() => this._drawChart());
    }

    public get isMinimal(): boolean { return this._isMinimal }
    public set isMinimal(value: boolean) {
        this._isMinimal = value;
        this._toggleMinimal(value);
    }

    public get showLegend(): boolean { return this._showLegend }
    public set showLegend(value: boolean) {
        this._showLegend = value;
        this._drawLegend();
        this._drawChart();
    }

    public get showTitle(): boolean { return this._showTitle }
    public set showTitle(value: boolean) {
        this._showTitle = value;
        this._toggleTitle();
    }

    public get showDesc(): boolean { return this._showDesc }
    public set showDesc(value: boolean) {
        this._showDesc = value;
        this._toggleDesc();
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
        this._setup();
    }

    static observedAttributes: string[] = ['is-minimal', 'show-legend', 'show-title', 'show-desc', 'x-unit', 'y-unit'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'is-minimal' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.isMinimal = true : this.isMinimal = false;
        }
        if (name === 'show-legend' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.showLegend = true : this.showLegend = false;
        }
        if (name === 'show-title' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.showTitle = true : this.showTitle = false;
        }
        if (name === 'show-desc' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.showDesc = true : this.showDesc = false;
        }
        if (name === 'x-unit') this.xUnit = newValue;
        if (name === 'y-unit') this.yUnit = newValue;
    }

    public disconnectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.unobserve(container);
    }

    private _setup(): void {
        this._handleSlots();
    }

    // Methods
    private _handleSlots(): void {
        const titleSlot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="title"]');
        const descSlot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="desc"]');

        if (titleSlot && titleSlot.assignedNodes().length === 0) titleSlot.style.display = 'none';
        if (descSlot && descSlot.assignedNodes().length === 0) descSlot.style.display = 'none';
    }

    private _toggleMinimal(isMinimal: boolean): void {
        const chart: HTMLDivElement | null = this.shadowRoot.querySelector('.line-chart');
        if (!chart) return;

        if (isMinimal) {
            this.setAttribute('show-title', 'false');
            this.setAttribute('show-desc', 'false');
            this.setAttribute('show-legend', 'false');
            chart.classList.add('line-chart--minimal');
        } else {
            this.setAttribute('show-title', 'true');
            this.setAttribute('show-desc', 'true');
            this.setAttribute('show-legend', 'true');
            chart.classList.remove('line-chart--minimal');

        }
    }

    private _toggleTitle(): void {
        const title: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="title"');
        if (title) this.showTitle ? title.classList.remove('header__title--hidden') : title.classList.add('header__title--hidden');
    }

    private _toggleDesc(): void {
        const desc: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="desc"');
        if (desc) this.showDesc ? desc.classList.remove('header__desc--hidden') : desc.classList.add('header__desc--hidden');
    }

    private _drawLegend(): void {
        const legend: HTMLDivElement | null = this.shadowRoot.querySelector('.legend');
        if (legend) {
            legend.removeAttribute('style');
            legend.innerHTML = '';
        }

        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = this._colors[i];
            if (this.showLegend) {
                if (legend && legend.childNodes.length < this.data.length) {
                    legend.style.marginTop = '16px';
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
        rect.classList.add('legend__item__circle');
        rect.style.backgroundColor = color;
        container.appendChild(rect);

        const label: HTMLSpanElement = document.createElement('span');
        label.classList.add('legend__item__label');
        label.innerText = labelText;
        container.appendChild(label);

        return container;
    }

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
            .range([padding, currentWidth - padding]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: number[]) => d[1] ?? 0)!])
            .range([currentHeight - padding, padding]);

        // svg
        const svg = d3.select(this.shadowRoot.querySelector('#line-chart'))
            .append('svg')
            .attr('width', currentWidth)
            .attr('height', currentHeight);

        // x axis
        const xAxis = svg.append('g')
            .attr('transform', 'translate(0,' + (currentHeight - padding) + ')')
            .call(d3.axisBottom(xScale).ticks(currentWidth / 50));

        xAxis.selectAll('text')
            .style('font-size', '.6rem')
            .style('font-family', 'Inter');

        xAxis.selectAll('.tick')
            .filter((d, i) => i === 0)
            .style('display', 'none');

        xAxis.selectAll('.tick')
            .filter((d, i, nodes) => i === nodes.length - 1)
            .remove();

        // y axis
        const yAxis = svg.append('g')
            .attr('transform', 'translate(' + padding + ', 0)')
            .call(d3.axisLeft(yScale).ticks(currentWidth / 50));

        yAxis.selectAll('text')
            .style('font-size', '.6rem')
            .style('font-family', 'Inter');

        yAxis.selectAll('.tick')
            .filter((d, i, nodes) => i === nodes.length - 1)
            .remove();

        yAxis.selectAll('.tick')
            .select('line')
            .style('display', 'none');

        yAxis.select('.domain')
            .style('display', 'none');

        // x uom
        svg.append('text')
            .attr('class', 'x-unit')
            .attr('x', currentWidth - padding)
            .attr('y', currentHeight - padding + 15)
            .style('font-size', '.6rem')
            .style('text-anchor', 'middle')
            .text(this.xUnit);

        // y uom
        svg.append('text')
            .attr('class', 'y-unit')
            .attr('x', padding - 4)
            .attr('y', padding)
            .style('font-size', '.6rem')
            .style('text-anchor', 'end')
            .text(this.yUnit);

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
            .attr('stroke', 'var(--chart-line-color)');

        // Area
        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = this._colors[i];

            svg.append('path')
                .datum(dataset.dataset)
                .attr('fill', color)
                .attr('fill-opacity', '.1')
                .attr('stroke', 'none')
                .attr('d', d3.area<number[]>()
                    .curve(d3.curveCardinal)
                    .x(d => xScale(d[0]))
                    .y0(currentHeight - padding)
                    .y1(d => yScale(d[1]))
                );
        });

        // Lines
        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = this._colors[i];

            const line = d3.line<number[]>()
                .curve(d3.curveCardinal)
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]));

            svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('d', line(dataset.dataset));
        });

        // Circles
        this.data.forEach((dataset: LineChartDataset, i: number) => {
            const color: string = this._colors[i];

            svg.append('g')
                .attr('class', 'points-group')
                .selectAll('points')
                .data(dataset.dataset)
                .enter()
                .append('circle')
                .attr('fill', color)
                .attr('stroke', 'none')
                .attr('cx', d => xScale(d[0]))
                .attr('cy', d => yScale(d[1]))
                .attr('r', 2)
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    d3.select('#d3-tooltip')
                        .transition().duration(200)
                        .style('opacity', 1)
                        .style('display', 'block')
                        .style('left', event.pageX + 8 + 'px')
                        .style('top', event.pageY + 8 + 'px')
                        .text(`${this.xUnit}: ${d[0]}, ${this.yUnit}: ${d[1]}`);
                })
                .on('mouseout', function () {
                    d3.select('#d3-tooltip')
                        .style('opacity', 0)
                        .style('display', 'none');
                });
        });

        // Tooltip
        if (!document.querySelector('#d3-tooltip')) {
            d3.select('body')
                .append('div')
                .attr('id', 'd3-tooltip')
                .attr('style', 'position: absolute; opacity: 0; display: none; color: var(--fg-color-on-emphasis); background-color: var(--bg-color-emphasis); padding: 8px; border-radius: 4px; max-width: 200px');
        }
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
}

customElements.define('ettdash-line-chart', LineChartComponent);