import '../components/grid.component';
import GridComponent from '../components/grid.component';
import WidgetComponent from '../components/widget.component';
import { AppConfig } from '../models/config.model';
import { Widget, WidgetSlot } from '../models/widget.model';
import { ConfigService } from '../services/config.service';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="dashboard">
        <app-grid></app-grid>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        @import "/src/style.css";

        :host {
            display: block;
            padding: 16px;
        }
    `
    ;

export default class DashboardPage extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _config: AppConfig = new AppConfig();
    private _configAutosave: number = 0;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get config(): AppConfig { return this._config }
    public set config(value: AppConfig) { this._config = value }

    // Component callbacks
    public async connectedCallback(): Promise<void> {
        const config: AppConfig = await ConfigService.instance.getConfig();      
        this._setup();
        this._fillGrid(config.widgets);
    }

    public disconnectedCallback(): void {
        clearInterval(this._configAutosave);
    }

    private _setup(): void {
        this._configAutosave = setInterval(this._handleGridChange.bind(this), 5000);
    }

    // Methods
    private _fillGrid(widgets: Widget[]): void {
        const grid: GridComponent | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        widgets.forEach((widget: Widget) => {
            let w: WidgetComponent = new WidgetComponent();
            this._setWidgetAttribute(w, widget.attributes);
            this._setWidgetSlot(w, widget.slots);
            grid.appendChild(w);
        });
    }

    private _setWidgetAttribute(widget: WidgetComponent, attributes: any): void {
        for (const key in attributes) {            
            widget.setAttribute(key, attributes[key]);
        }
    }

    private _setWidgetSlot(widget: WidgetComponent, slots: WidgetSlot[]): void {
        slots.forEach((slot: WidgetSlot) => {       
            const element: HTMLElement = document.createElement(slot.tag);
            element.innerHTML = slot.content;
            element.setAttribute('slot', slot.name);

            for (const key in slot.attributes) {                  
                element.setAttribute(key, slot.attributes[key]);
            }
            
            widget.appendChild(element);
        });
    }

    private _getGridContent(): any[] {
        const grid: GridComponent | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return [];

        const widgetNodes: HTMLElement[] = Array.from(grid.querySelectorAll('app-widget'));

        const widgets: Widget[] = widgetNodes.map((node: HTMLElement) => {
            const widget: Widget = {
                attributes: this._getNodeAttributes(node),
                slots: []
            }

            const children: HTMLElement[] = Array.from(node.querySelectorAll('*'));

            children.forEach((child: HTMLElement) => {
                const slot: any = {};
                slot.name = child.slot;
                slot.tag = child.tagName;
                slot.attributes = this._getNodeAttributes(child);
                slot.content = child.textContent;
                widget.slots.push(slot);
            });
            return widget;
        });
      
        return widgets;
    }

    private _getNodeAttributes(node: HTMLElement): Record<string, any> {
        return Array.from(node.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
        }, {} as { [key: string]: string });
    }

    private _handleGridChange(): void {
        const widgets: any[] = this._getGridContent();    
        const config = new AppConfig();
        config.id = 'custom';
        config.label = 'Custom';
        config.widgets = [...widgets];
        ConfigService.instance.config = config;
    }
}

customElements.define('page-dashboard', DashboardPage);