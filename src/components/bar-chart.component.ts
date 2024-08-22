import * as d3 from 'd3';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="bar-chart">
        <div class="header">
            <slot name="title" class="header__title"></slot>
            <slot name="desc" class="header__desc"></slot>
        </div>
        <div id="bar-chart" class="chart"></div>
        <div class="legend"></div>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .bar-chart {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
    }

    .bar-chart.line-chart--minimal {
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

    #bar-chart {
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
export class BarChartComponent extends HTMLElement {
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
    private _data: [number, number][] = [
        [1, 25],
        [5, 15],
        [7, 40],
        [8, -20]
    ];
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
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#bar-chart');
        if (container) this._resizeObserver.observe(container);
        this._setup();
    }

    public disconnectedCallback(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#line-chart');
        if (container) this._resizeObserver.unobserve(container);
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

    private _setup() {
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
        const chart: HTMLDivElement | null = this.shadowRoot.querySelector('.bar-chart');
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
        if (!legend) return;

        legend.removeAttribute('style');
        legend.innerHTML = '';

        if (this.showLegend) {
            const color: string = this._colors[0];
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

        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#bar-chart');
        if (!container) return;
        container.innerHTML = '';

        // Chart
        const currentWidth: number = this._getContainerSize('bar-chart', 'width');
        const currentHeight: number = this._getContainerSize('bar-chart', 'height');
        const padding: number = 24;

        // Scale
        const data: [number, number][] = this.data;

        const isDateX = this.dateUnit === 'x';
        const isDateY = this.dateUnit === 'y';

        const xScale =
            isDateX ?
                d3.scaleBand()
                    .domain(data.map((d: [number, number]) => new Date(d[0]).toString()))
                    .range([padding, currentWidth - padding])
                    .padding(.4)
                : d3.scaleBand()
                    .domain(data.map((d: [number, number]) => d[0].toString()))
                    .range([padding, currentWidth - padding])
                    .padding(.4)

        const yScale = d3.scaleLinear()
            .domain([
                Math.min(0, d3.min(data, (d: [number, number]) => d[1]) || 0),
                d3.max(data, (d: [number, number]) => d[1]) || 0
            ])
            .range([currentHeight - padding, padding])
            .nice()

        // SVG
        const svg = d3.select(this.shadowRoot.querySelector('#bar-chart'))
            .append('svg')
            .attr('width', currentWidth)
            .attr('height', currentHeight);

        // Horizontal grid
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

        // Chart
        const color: string = this._colors[0];

        // Bars
        svg.append('g')
            .attr('fill', color)
            .attr('fill-opacity', .25)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .selectAll('rect')
            .data(data)
            .join('rect')
            // .attr('x', (d: [number, number]) => xScale(d[0].toString()) || 0)
            .attr('x', (d: [number, number]) => xScale(isDateX ? new Date(d[0]).toString() : d[0].toString()) || 0)
            .attr('y', (d: [number, number]) => d[1] >= 0 ? yScale(d[1]) : yScale(0))
            .attr('width', xScale.bandwidth())
            .attr('height', (d: [number, number]) => Math.abs(yScale(d[1]) - yScale(0)));

        // X axis
        const xAxis = svg.append('g')
            .attr('transform', 'translate(0,' + (currentHeight - padding) + ')')
            .call(d3.axisBottom(xScale).ticks(currentWidth / 50));

        xAxis.selectAll('text')
            .style('font-size', '.6rem')
            .style('font-family', 'Inter');

        // Y axis
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
    }

    private _getContainerSize(id: string, size: string): number {
        if (!d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size)) return 0;
        return parseInt(d3.select(this.shadowRoot.querySelector(`#${id}`)).style(size), 10);
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

customElements.define('ettdash-bar-chart', BarChartComponent);