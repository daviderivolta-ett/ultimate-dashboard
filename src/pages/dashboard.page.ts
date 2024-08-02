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
        this._render();
        this._setup();
        this._fillGrid(config.widgets);
    }

    private _render(): void { }

    private _setup(): void {
        this.addEventListener('grid-order-changed', this._getGridContent);
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

    private _getGridContent() {
        const grid: GridComponent | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        // const widgetNodes: NodeListOf<HTMLElement> = grid.querySelectorAll('*');
        // const widgetsArray: HTMLElement[] = Array.from(widgetNodes);

        // const widgetsData = widgetsArray.map((node: HTMLElement) => ({
        //     tagName: node.tagName,
        //     id: node.id,
        //     classList: Array.from(node.classList),
        //     attributes: Array.from(node.attributes).reduce((attrs: any, attr) => {
        //         attrs[attr.name] = attr.value;
        //         return attrs;
        //     }, {})
        // }));

        // console.log(widgetsData);

        const widgetNodes: HTMLElement[] = Array.from(grid.querySelectorAll('app-widget'));

        const widgets = widgetNodes.map((node: HTMLElement) => ({
            type: node.tagName,
            size: node.getAttribute('size'),
            'is-fullwidth': node.getAttribute('is-fullwidth'),
            input: {}
        }));

        widgetNodes.forEach((node: HTMLElement) => {
            const child: HTMLElement[] = Array.from(node.querySelectorAll('*'));
            child.forEach((node: HTMLElement) => {
                console.log(Array.from(node.attributes));
            });            
        });

        console.log(widgets);

    }
}

customElements.define('page-dashboard', DashboardPage);