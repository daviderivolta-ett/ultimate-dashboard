import '../components/grid.component';
import GridComponent from '../components/grid.component';
import WidgetComponent from '../components/widget.component';
import { AppConfig } from '../models/config.model';
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
    private _fillGrid(widgets: any[]): void {
        const grid: GridComponent | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        widgets.forEach((widget: any) => {
            let w: WidgetComponent = new WidgetComponent();
            this._setWidgetAttribute(w, widget);

            if (widget['type']) {
                const component: HTMLElement = document.createElement(widget.type);
                component.setAttribute('slot', 'content');
                if (widget['input']) this._setComponentAttribute(component, widget.input);
                w.appendChild(component);
            }

            grid.appendChild(w);
        });
    }

    private _setWidgetAttribute(widget: WidgetComponent, input: any): void {
        for (const key in input) {
            if (key === 'type' || key === 'input') continue;
            widget.setAttribute(key, input[key]);
        }
    }

    private _setComponentAttribute(component: HTMLElement, input: any): void {
        for (const key in input) {
            component.setAttribute(`${key}`, `${input[key]}`);
        }
    }

    private _getGridContent(): any[] {
        const grid: GridComponent | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return [];

        const widgetNodes: HTMLElement[] = Array.from(grid.querySelectorAll('app-widget'));

        const widgets: any[] = widgetNodes.map((node: HTMLElement) => {
            const widget: any = {
                type: '',
                size: node.getAttribute('size'),
                'is-fullwidth': node.getAttribute('is-fullwidth'),
                input: {}
            }
            const child: HTMLElement[] = Array.from(node.querySelectorAll('*'));
            child.forEach((node: HTMLElement) => {
                widget.type = node.tagName;
                const attributes: Attr[] = Array.from(node.attributes).filter((attr: Attr) => attr.name !== 'slot');
                const input: { [key: string]: string } = attributes.reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {} as { [key: string]: string });

                widget.input = input;
            });
            return widget;
        });

        return widgets;
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