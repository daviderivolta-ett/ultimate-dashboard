import { LngLat, LngLatBounds, Map } from 'maplibre-gl';
import maplibreStyle from 'maplibre-gl/dist/maplibre-gl.css?raw';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="map"></div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    #map {
        height: 100%;
        z-index: 0;
        border-radius: var(--border-radius);
    }
    `
    ;

// Component
export default class MapComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _map!: Map;
    private _center: [number, number] = [0, 0];
    private _zoom: number = 0;
    private _layerUrl: string = '';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        const maplibreStyleSheet: CSSStyleSheet = new CSSStyleSheet();
        maplibreStyleSheet.replaceSync(maplibreStyle);
        this.shadowRoot.adoptedStyleSheets.push(maplibreStyleSheet);
    }

    public get center(): [number, number] { return this._center }
    public set center(value: [number, number]) {
        this._center = value;
        if (this._map) this._map.setCenter(new LngLat(value[1], value[0]));
    }

    public get zoom(): number { return this._zoom }
    public set zoom(value: number) {
        this._zoom = value;
        if (this._map) this._map.setZoom(value);
    }

    public get layerUrl(): string { return this._layerUrl }
    public set layerUrl(value: string) {
        this._layerUrl = value;
        if (this._map) this._addGeoJsonLayer();
    }

    // Component callbacks
    public connectedCallback(): void {
        this._initMap();
    }

    static observedAttributes: string[] = ['lat', 'lng', 'zoom', 'layer-url'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (newValue !== oldValue) {
            if (name === 'lat') this.center = [parseFloat(newValue), this.center[1]];
            if (name === 'lng') this.center = [this.center[0], parseFloat(newValue)];
            if (name === 'zoom') this.zoom = parseFloat(newValue);
            if (name === 'layer-url') this.layerUrl = newValue;
        }
    }

    // Methods
    private _initMap(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#map');
        if (!container) return;

        this._map = new Map({
            container,
            style: '/settings/map-light.json',
            center: [0, 0],
            zoom: 1
        });

        this._map.setZoom(this.zoom);
        this._map.setCenter(new LngLat(this.center[1], this.center[0]));
        this._map.on('load', () => {
            this._map.resize();
            if (this.layerUrl.length > 0) this._addGeoJsonLayer();
        });
    }

    private async _addGeoJsonLayer(): Promise<void> {
        const geojson = await this._fetchLayer(this.layerUrl);
        console.log(geojson);

        this._map.addSource('layer', {
            type: 'geojson',
            data: geojson
        })

        this._map.addLayer({
            id: 'layer',
            type: 'circle',
            source: 'layer',
            paint: {
                'circle-radius': 6,
                'circle-color': '#FF0000'
            }
        });

        this._fitMapToGeoJson(geojson);
    }

    private async _fetchLayer(url: string): Promise<any> {
        const res: Response = await fetch(url);
        const data: any = await res.json();
        return data;
    }

    private _fitMapToGeoJson(geojson: any): void {
        if (!geojson || !geojson.features || geojson.features.length === 0) return;

        const bounds = new LngLatBounds();

        geojson.features.forEach((feature: any) => {
            if (feature.geometry && feature.geometry.type === 'Point') {
                bounds.extend(new LngLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]));
            } else if (feature.geometry && (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon')) {
                feature.geometry.coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(new LngLat(coord[0], coord[1]));
                });
            }
        });

        this._map.fitBounds(bounds);
        this.zoom = 16;
    }
}

customElements.define('ettdash-map', MapComponent);