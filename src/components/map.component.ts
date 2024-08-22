import { LngLat, LngLatBounds, Map, Popup } from 'maplibre-gl';
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
        if (this._map) {
            this._map.setCenter(new LngLat(value[1], value[0]));
        }
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

            const layers: string[] = ['points-layer', 'lines-layer', 'polygons-layer'];

            layers.forEach((id: string) => {
                this._setCursor(id);
                this._map.on('click', id, (e: any) => {
                    if (e.features && e.features.length > 0) this._onClickOnFeature(e);
                });
            });
        });
    }

    private _onClickOnFeature(e: any): void {
        const feature: any = e.features[0];
        const properties: any = feature.properties;
        const content: HTMLDivElement = document.createElement('div');

        for (const key in properties) {
            content.innerHTML = `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${properties[key]}</p>`;
        }

        new Popup()
            .setLngLat(e.lngLat)
            .setHTML(content.outerHTML)
            .addTo(this._map)
    }

    private _setCursor(layerId: string): void {
        this._map.on('mouseenter', layerId, () => {
            this._map.getCanvas().style.cursor = 'pointer';
        });

        this._map.on('mouseleave', layerId, () => {
            this._map.getCanvas().style.cursor = '';
        });
    }

    private async _addGeoJsonLayer(): Promise<void> {
        const geojson = await this._fetchLayer(this.layerUrl);

        const pointFeatures: any[] = geojson.features.filter((feature: any) => feature.geometry && feature.geometry.type === 'Point');
        const lineStringFeatures: any[] = geojson.features.filter((feature: any) => feature.geometry && feature.geometry.type === 'LineString');
        const polygonFeatures: any[] = geojson.features.filter((feature: any) => feature.geometry && feature.geometry.type === 'Polygon');

        if (pointFeatures.length > 0) this._addGeoJsonCircleLayer(pointFeatures);
        if (lineStringFeatures.length > 0) this._addGeoJsonLineLayer(lineStringFeatures);
        if (polygonFeatures.length > 0) this._addGeoJsonPolygonLayer(polygonFeatures);

        this._fitMapToGeoJson(geojson);
    }

    private async _fetchLayer(url: string): Promise<any> {
        try {
            const res: Response = await fetch(url);
            if (!res.ok) throw new Error(`Errore nel recuper del layer ${res.statusText}`);

            const data: any = await res.json();
            if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Il file non è un GeoJSON valido');

            return data;

        } catch (error) {
            throw new Error(`Errore sconosciuto nel recupero del layer da ${this.layerUrl}`);
        }
    }

    private _addGeoJsonCircleLayer(features: any[]): void {
        this._map.addSource('points', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        this._map.addLayer({
            id: 'points-layer',
            type: 'circle',
            source: 'points',
            paint: {
                'circle-radius': 6,
                'circle-color': '#18A0FB',
                'circle-opacity': .5,
                'circle-stroke-color': '#18A0FB',
                'circle-stroke-opacity': 1,
                'circle-stroke-width': 2
            }
        });
    }

    private _addGeoJsonLineLayer(features: any[]) {
        this._map.addSource('lines', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        this._map.addLayer({
            id: 'lines-layer',
            type: 'line',
            source: 'lines',
            paint: {
                'line-width': 2,
                'line-color': '#18A0FB'
            }
        });
    }

    private _addGeoJsonPolygonLayer(features: any[]) {
        this._map.addSource('polygons', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        this._map.addLayer({
            id: 'polygons-layer',
            type: 'fill',
            source: 'polygons',
            paint: {
                'fill-color': '#18A0FB',
                'fill-opacity': .5
            }
        })
    }

    private _fitMapToGeoJson(geojson: any): void {
        if (!geojson || !geojson.features || geojson.features.length === 0) return;

        const bounds: LngLatBounds = new LngLatBounds();

        geojson.features.forEach((feature: any) => {
            if (feature.geometry && feature.geometry.type === 'Point') {
                bounds.extend(new LngLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]));
            } else if (feature.geometry && (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon')) {
                feature.geometry.coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(new LngLat(coord[0], coord[1]));
                });
            }
        });

        const center: LngLat = bounds.getCenter();
        this.center = [center.lat, center.lng];
        this.zoom = 16;
    }
}

customElements.define('ettdash-map', MapComponent);