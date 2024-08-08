import '../components/grid.component';
import GridComponent from '../components/grid.component';
import WidgetComponent from '../components/widget.component';
import { AppConfig, GridConfig } from '../models/config.model';
import { Widget, WidgetSlot } from '../models/widget.model';
import { ConfigService } from '../services/config.service';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="dashboard">
        <app-grid></app-grid>
        <widget-icons class="widget-icons"></widget-icons>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    @import "/src/style.css";

    .dashboard {
        display: block;
        padding: 16px;
        min-height: 100dvh;
    }

    .widget-icons {
        position: fixed;
        bottom: 24px;
        right: 24px;
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
        const gridConfig: GridConfig = await ConfigService.instance.getGridConfig();
        this._setup();
        this._fillGrid(gridConfig.grid);
    }

    public disconnectedCallback(): void {
        this._removeEventListeners();
    }

    private _setup(): void {
        this._configAutosave = setInterval(this._handleGridChange.bind(this), 5000);
        this._setupWidgetIcons();
    }

    private _removeEventListeners(): void {
        clearInterval(this._configAutosave);
        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        if (dashboard) {
            dashboard.addEventListener('dragover', this._handleGridDragOver.bind(this));
            dashboard.addEventListener('drop', this._handleGridDrop.bind(this));
        }
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
        const config = new GridConfig();
        config.id = 'custom';
        config.label = 'Custom';
        config.grid = [...widgets];
        ConfigService.instance.gridConfig = config;
    }

    private _setupWidgetIcons(): void {
        const grid: HTMLElement | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        const icons: NodeListOf<HTMLElement> = this.shadowRoot.querySelectorAll('widget-icons>*');

        if (dashboard) {
            dashboard.addEventListener('dragover', this._handleGridDragOver.bind(this));
            dashboard.addEventListener('drop', this._handleGridDrop.bind(this));

            icons.forEach((icon: HTMLElement) => icon.addEventListener('dragstart', this._handleIconDragStart.bind(this)))
        }
    }

    private _handleIconDragStart(event: DragEvent): void {
        const target = event.target as HTMLElement;
        if (target && target.id) {
            const id: string | undefined = target.id.split('#').pop();
            if (id) event.dataTransfer?.setData('text/plain', id);
        }
    }

    private _handleGridDragOver(event: DragEvent): void {
        event.preventDefault();

        const grid: HTMLElement | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        const dropTargetRect = grid.getBoundingClientRect();

        if (event.clientX >= dropTargetRect.left &&
            event.clientX <= dropTargetRect.right &&
            event.clientY >= dropTargetRect.top &&
            event.clientY <= dropTargetRect.bottom) {
            event.dataTransfer!.dropEffect = 'copy';
        } else {
            event.dataTransfer!.dropEffect = 'none';
        }
    }

    private _handleGridDrop(event: DragEvent): void {
        console.log(event.dataTransfer);
        const grid: HTMLElement | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;

        const tag: string | undefined = event.dataTransfer?.getData('text/plain');
        if (tag) this._addWidget(tag);
        

        // const dropTargetRect = grid.getBoundingClientRect();

        // if (event.clientX >= dropTargetRect.left &&
        //     event.clientX <= dropTargetRect.right &&
        //     event.clientY >= dropTargetRect.top &&
        //     event.clientY <= dropTargetRect.bottom) {
        //     console.log('Element dropped on the target');
        // } else {
        //     console.log('Element not dropped on the target');
        // }
    }

    private _addWidget(tag: string): void {
        const widget: WidgetComponent = new WidgetComponent();
        const el: HTMLElement = document.createElement(tag);
        el.setAttribute('slot', 'content');
        widget.appendChild(el);
        const grid: HTMLElement | null = this.shadowRoot.querySelector('app-grid');
        if (!grid) return;
        grid.appendChild(widget);
    }
}

customElements.define('page-dashboard', DashboardPage);