import * as d3 from 'd3';

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
    private _dateUnit: 'x' | 'y' | 'none' = 'none';

    private _dataUrl: string = '';
    private _data: [number, number][] = [];
    private _label: string = '';

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
        this._drawChart();
    }

    public get yUnit(): string { return this._yUnit }
    public set yUnit(value: string) {
        this._yUnit = value;
        this._drawChart();
    }

    public get dateUnit(): 'x' | 'y' | 'none' { return this._dateUnit }
    public set dateUnit(value: 'x' | 'y' | 'none') {
        this._dateUnit = value;
        this._drawChart();
    }

    public get dataUrl(): string { return this._dataUrl }
    public set dataUrl(value: string) {
        this._dataUrl = value;
        this._getDataFromUrl(value).then((data: any) => this.data = data);
    }

    public get data(): [number, number][] { return this._data }
    public set data(value: [number, number][]) {
        this._data = value;
        this._drawChart();
    }

    public get label(): string { return this._label }
    public set label(value: string) {
        this._label = value;
        this._drawLegend();
    }

    // Component callbacks
    public connectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.observe(container);
        this._setup();
    }

    static observedAttributes: string[] = ['is-minimal', 'show-legend', 'show-title', 'show-desc', 'x-unit', 'y-unit', 'date-unit', 'dataset-url', 'label'];
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
        if (name === 'date-unit') {
            (newValue === 'x' || newValue === 'y') ? this.dateUnit = newValue : this.dateUnit = 'none';
        }
        if (name === 'dataset-url') this.dataUrl = newValue;
        if (name === 'label') this.label = newValue;
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

        const color: string = this._colors[0];
        if (legend && this.showLegend) {
            legend.style.marginTop = '16px';
            const item: HTMLDivElement = this._drawLegendItem(color, this.label);
            legend.appendChild(item);
        }
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
        if (this.data.length === 0) return;

        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (!container) return;
        container.innerHTML = '';

        // chart
        const currentWidth: number = this._getContainerSize('line-chart', 'width');
        const currentHeight: number = this._getContainerSize('line-chart', 'height');
        const padding: number = 24;

        this._sortDataset(this.data);

        // scale
        const data: [number, number][] = this.data;

        const isDateX = this.dateUnit === 'x';
        const isDateY = this.dateUnit === 'y';

        // if (isDateX) {
        //     const xScale = d3.scaleTime()
        //         .domain([new Date(d3.min(data, (d: [number, number]) => d[0])!), new Date(d3.max(data, (d: [number, number]) => d[0])!)])
        //         .range([padding, currentWidth - padding])
        // } else {
        //     const xScale = d3.scaleLinear()
        //         .domain([d3.min(data, (d: number[]) => d[0] ?? 0)!, d3.max(data, (d: number[]) => d[0] ?? 0)!])
        //         .range([padding, currentWidth - padding]);
        // }

        const xScale = isDateX
            ? d3.scaleTime()
                .domain([new Date(d3.min(data, (d: [number, number]) => d[0])!), new Date(d3.max(data, (d: [number, number]) => d[0])!)])
                .range([padding, currentWidth - padding])
            : d3.scaleLinear()
                .domain([d3.min(data, (d: number[]) => d[0] ?? 0)!, d3.max(data, (d: number[]) => d[0] ?? 0)!])
                .range([padding, currentWidth - padding]);



        const yMin: number = d3.min(data, (d: [number, number]) => d[1] ?? 0)!;
        const yMax: number = d3.max(data, (d: [number, number]) => d[1] ?? 0)!;

        const yRange: number = yMax - yMin;
        const yPadding: number = yRange * 0.1;

        // const yScale = d3.scaleLinear()
        //     .domain([yMin - yPadding, yMax + yPadding])
        //     .range([currentHeight - padding, padding]);

        const yScale = isDateY
            ? d3.scaleTime()
                .domain([new Date(d3.min(data, (d: [number, number]) => d[1])!), new Date(d3.max(data, (d: [number, number]) => d[1])!)])
                .range([currentHeight - padding, padding])
            : d3.scaleLinear()
                .domain([yMin - yPadding, yMax + yPadding])
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
        if (yScale.ticks().length > 0 && typeof yScale.ticks()[0] === 'number') {
            svg.append('g')
                .attr('class', 'grid')
                .selectAll('line')
                .data(yScale.ticks() as number[])
                .join('line')
                .attr('y1', d => yScale(d))
                .attr('y2', d => yScale(d))
                .attr('x1', padding)
                .attr('x2', currentWidth - padding)
                .attr('stroke', 'var(--chart-line-color)');
        }

        if (yScale.ticks().length > 0 && yScale.ticks()[0] instanceof Date) {
            svg.append('g')
                .attr('class', 'grid')
                .selectAll('line')
                .data(yScale.ticks() as Date[])
                .join('line')
                .attr('y1', d => yScale(d))
                .attr('y2', d => yScale(d))
                .attr('x1', padding)
                .attr('x2', currentWidth - padding)
                .attr('stroke', 'var(--chart-line-color)');
        }


        // Chart
        const color: string = this._colors[0];

        // Area      
        svg.append('path')
            .datum(data)
            .attr('fill', color)
            .attr('fill-opacity', .25)
            .attr('stroke', 'none')
            .attr('d', d3.area<number[]>()
                .curve(d3.curveCardinal)
                .x(d => xScale(d[0]))
                .y0(currentHeight - padding)
                .y1(d => yScale(d[1]))
            );

        // Line
        const line = d3.line<number[]>()
            .curve(d3.curveCardinal)
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]));

        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line(data));

        // Circles
        svg.append('g')
            .attr('class', 'points-group')
            .selectAll('points')
            .data(data)
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
                    .text(`${this.xUnit}: ${isDateX ? this._formatDate(d[0]) : d[0]}, ${this.yUnit}: ${isDateY ? this._formatDate(d[0]) : d[1]}`);
            })
            .on('mouseout', function () {
                d3.select('#d3-tooltip')
                    .style('opacity', 0)
                    .style('display', 'none');
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

    private _sortDataset(data: [number, number][]): [number, number][] {
        return data.sort((a: [number, number], b: [number, number]) => a[0] - b[0]);
    }

    private async _getDataFromUrl(url: string): Promise<any> {
        try {
            const res: Response = await fetch(url);
            if (!res.ok) throw new Error(`Errore nel recupero dei dati ${res.statusText}`);
            const data: any = await res.json();
            return data;
        } catch (error) {
            throw new Error(`Errore sconosciuto nel recupero dei dati da ${url}`);
        }
    }

    private _formatDate(timestamp: number): string {
        const date: Date = new Date(timestamp);
    
        const day: string = String(date.getDate()).padStart(2, '0');
        const month: string = String(date.getMonth() + 1).padStart(2, '0');
        const year: string = String(date.getFullYear());
    
        const hours: string = String(date.getHours()).padStart(2, '0');
        const minutes: string = String(date.getMinutes()).padStart(2, '0');
    
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    }
}

customElements.define('ettdash-line-chart', LineChartComponent);