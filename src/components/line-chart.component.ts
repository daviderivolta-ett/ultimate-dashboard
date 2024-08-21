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

    private _dataUrl: string = '';
    private _parserUrl: string = '';
    private _rawData: any = null;
    private _parser: any = null;
    private _data: LineChartDataset[] = [
        {
            label: 'Example label',
            dataset: [
                [1723622400000, 33.45500036666666],
                [1723626000000, 33.803333733333325],
                [1723629600000, 33.315000399999995],
                [1723633200000, 33.155000566666644],
                [1723636800000, 33.58500043333333],
                [1723640400000, 33.441667266666656],
                [1723644000000, 33.658334066666654],
                [1723647600000, 33.65500039999999],
                [1723651200000, 34.03833376666666],
                [1723654800000, 33.47833349999999],
                [1723658400000, 32.35833385000001],
                [1723662000000, 30.945000150000006],
                [1723665600000, 29.382608760869555],
                [1723669200000, 29.33833383333335],
                [1723672800000, 29.04166696666665],
                [1723676400000, 29.435000150000022],
                [1723680000000, 28.95833341666668],
                [1723683600000, 28.34210538596488],
                [1723687200000, 27.65625014583335],
                [1723690800000, 27.70416677083333],
                [1723694400000, 27.841667104166664],
                [1723698000000, 27.418750437500005],
                [1723701600000, 28.041666750000015],
                [1723705200000, 29.579166875],
                [1723708800000, 30.71875016666668],
                [1723712400000, 29.639583395833345],
                [1723716000000, 26.731250187500006],
                [1723719600000, 24.32500027083334],
                [1723723200000, 26.40833350000001],
                [1723726800000, 29.595833499999998],
                [1723730400000, 30.954166833333346],
                [1723734000000, 31.916666854166653],
                [1723737600000, 32.10000045833333],
                [1723741200000, 31.893750229166674],
                [1723744800000, 30.772916791666677],
                [1723748400000, 29.531250249999996],
                [1723752000000, 28.856250250000006],
                [1723755600000, 28.64166681250001],
                [1723759200000, 28.391667166666668],
                [1723762800000, 27.916666833333327],
                [1723766400000, 27.539583666666672],
                [1723770000000, 27.120833604166666],
                [1723773600000, 27.412500145833317],
                [1723777200000, 27.183333520833344],
                [1723780800000, 26.793750104166666],
                [1723784400000, 27.391666875],
                [1723788000000, 27.156250104166674],
                [1723791600000, 28.31250029166667],
                [1723795200000, 30.27083352083334],
                [1723798800000, 30.55000010416667],
                [1723802400000, 30.158333500000023],
                [1723806000000, 31.147916937500025],
                [1723809600000, 30.906250125000014],
                [1723813200000, 30.93541689583334],
                [1723816800000, 30.779166895833328],
                [1723820400000, 31.89791693749999],
                [1723824000000, 33.208000240000004],
                [1723827600000, 33.112500208333344],
                [1723831200000, 32.179166854166674],
                [1723834800000, 30.039583520833318],
                [1723838400000, 29.15833356250002],
                [1723842000000, 28.76666672916667],
                [1723845600000, 28.039583374999996],
                [1723849200000, 27.545833395833345],
                [1723852800000, 27.40833352083334],
                [1723856400000, 27.27500043749997],
                [1723860000000, 26.827084020833336],
                [1723863600000, 26.31458347916666],
                [1723867200000, 25.993750145833335],
                [1723870800000, 26.03750004166666],
                [1723874400000, 26.687500104166656],
                [1723878000000, 28.641666812500002],
                [1723881600000, 29.13333362499999],
                [1723885200000, 29.70208339583333],
                [1723888800000, 24.93125016666667],
                [1723892400000, 26.675000145833323],
                [1723896000000, 29.177083437500006],
                [1723899600000, 30.61666683333334],
                [1723903200000, 30.33750018749998],
                [1723906800000, 30.304166937500003],
                [1723910400000, 30.439583479166654],
                [1723914000000, 29.981250104166687],
                [1723917600000, 29.510416854166674],
                [1723921200000, 28.133333416666677],
                [1723924800000, 27.643750166666674],
                [1723928400000, 27.431250020833343],
                [1723932000000, 27.33508833333334],
                [1723935600000, 27.037500160714313],
                [1723939200000, 26.991071428571434],
                [1723942800000, 26.014285964285712],
                [1723946400000, 22.45892880357144],
                [1723950000000, 22.696428982142855],
                [1723953600000, 23.517857375000013],
                [1723957200000, 23.705357232142855],
                [1723960800000, 23.75357160714284],
                [1723964400000, 24.241071535714294],
                [1723968000000, 24.689286196428547],
                [1723971600000, 24.826786053571443]      
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

    public get dataUrl(): string { return this._dataUrl }
    public set dataUrl(value: string) {
        this._dataUrl = value;
        this._getDataFromUrl(value).then((data: any) => this.rawData = data);
    }

    public get parserUrl(): string { return this._parserUrl }
    public set parserUrl(value: string) {
        this._parserUrl = value;
        this._getParserFromUrl(value).then((parser: any) => this.parser = parser);
    }

    public get rawData(): any { return this._rawData }
    public set rawData(value: any) {
        this._rawData = value;
        this.data = this._parseRawData();
    }
    
    public get parser(): any { return this._parser }
    public set parser(value: any) {
        this._parser = value;
        this.data = this._parseRawData();     
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

    static observedAttributes: string[] = ['is-minimal', 'show-legend', 'show-title', 'show-desc', 'x-unit', 'y-unit', 'dataset-url', 'parser-url'];
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
        if (name === 'dataset-url') this.dataUrl = newValue;
        if (name === 'parser-url') this.parserUrl = newValue;
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

        const yMin = d3.min(data, (d: number[]) => d[1] ?? 0)!;
        const yMax = d3.max(data, (d: number[]) => d[1] ?? 0)!;
        const yRange = yMax - yMin;
        const yPadding = yRange * 0.1;

        const yScale = d3.scaleLinear()
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

    private async _getParserFromUrl(url: string): Promise<any> {
        try {
            const module: any = await import(url);
            return module.default;
        } catch (error) {
            throw new Error('Errore nel recupero del modulo del parser');
        }
    }

    private _parseRawData(): any {
        if (this.rawData && this.parser) {
            try {
                const data: any = this.parser(this.rawData);              
                return data;
            } catch (error) {
                throw new Error('Errore nel parsing dei dati');
            }
        }
    }
}

customElements.define('ettdash-line-chart', LineChartComponent);