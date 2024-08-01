import { LngLat, Map } from 'maplibre-gl';
import maplibreStyle from 'maplibre-gl/dist/maplibre-gl.css?raw';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="map"></div>
    `
    ;

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

export default class MapComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _map!: Map;
    private _center: [number, number] = [0, 0];
    private _zoom: number = 0;

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

    public connectedCallback(): void {
        this._initMap();
    }

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
    }

    static observedAttributes: string[] = ['lat', 'lng', 'zoom'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (newValue !== oldValue) {
            if (name === 'lat') this.center = [parseFloat(newValue), this.center[1]];
            if (name === 'lng') this.center = [this.center[0], parseFloat(newValue)];
            if (name === 'zoom') this.zoom = parseFloat(newValue);
        }
    }
}

customElements.define('app-map', MapComponent);