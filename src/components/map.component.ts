import { Map } from 'maplibre-gl';
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
        border-radius: 8px;
    }
    `
    ;

export default class MapComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _map!: Map;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));

        const maplibreStyleSheet: CSSStyleSheet = new CSSStyleSheet();
        maplibreStyleSheet.replaceSync(maplibreStyle);
        this.shadowRoot.adoptedStyleSheets.push(maplibreStyleSheet);
    }

    public connectedCallback(): void {
        this._initMap();
    }

    private _initMap(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('#map');
        if (!container) return;

        this._map = new Map({
            container,
            style: 'https://demotiles.maplibre.org/style.json',
            center: [0, 0],
            zoom: 1
        });
    }
}

customElements.define('app-map', MapComponent);