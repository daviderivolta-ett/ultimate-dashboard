import '../components/grid.component';
import GridComponent from '../components/grid.component';
import WidgetComponent from '../components/widget.component';
import { AppConfig } from '../models/config.model';
import { WidgetSize } from '../models/widget.model';
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
        console.log(config);        
        this.render();
        this._fillGrid(config.widgets);
    }

    private render(): void { }

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
                grid.appendChild(w);
            }
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
}

customElements.define('page-dashboard', DashboardPage);