import '../components/grid.component';
import GridComponent from '../components/grid.component';
import CardComponent from '../components/card.component';
import { AppConfig, AppConfigWidget, GridConfig, GridConfigWidget, GridConfigWidgetSlot, WizardItem } from '../models/config.model';
import { ConfigService } from '../services/config.service';
import { WidgetIcon, WidgetIconsComponent } from '../components/widget-icons.component';
import WizardFormComponent from '../components/form.component';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="dashboard">
        <draggable-grid></draggable-grid>
        <dialog class="dialog"></dialog>
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

    .dialog {
        transition: display .2s allow-discrete, overlay .2s allow-discrete;      
        animation: bounce-out .2s forwards;
        &[open] {
            animation: bounce-in .2s forwards;
        }
    }
      
    @keyframes open {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
      
    @keyframes close {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @keyframes bounce-in {
        0% {
            opacity: 0;
            transform: scale(.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% { transform: scale(.9); }
        100% { transform: scale(1); }
    }

    @keyframes bounce-out {
        0% { transform: scale(1); }
        25% { transform: scale(.95); }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
        100% {
            opacity: 0;
            transform: scale(.3);
        } 
    }
    `
    ;

export default class DashboardPage extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _configAutosave: number = 0;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    // Component callbacks
    public async connectedCallback(): Promise<void> {
        const appConfig: AppConfig = await ConfigService.instance.getAppConfig();
        console.log(appConfig);
        const gridConfig: GridConfig = await ConfigService.instance.getGridConfig();
        this._render();
        this._setup();
        this._fillGrid(gridConfig.grid);
    }

    public disconnectedCallback(): void {
        this._removeEventListeners();
    }

    private _render(): void {
        this._renderWidgetIcons();
    }

    private _setup(): void {
        this._configAutosave = setInterval(this._handleGridChange.bind(this), 5000);
        this._setupWidgetIcons();
        this.addEventListener('form-submit', this._handleWizardFormSubmit.bind(this));
    }

    private _removeEventListeners(): void {
        clearInterval(this._configAutosave);
        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        if (dashboard) {
            dashboard.removeEventListener('dragover', this._handleGridDragOver.bind(this));
            dashboard.removeEventListener('drop', this._handleGridDrop.bind(this));
        }
        this.removeEventListener('form-submit', this._handleWizardFormSubmit.bind(this));
    }

    // Methods
    // Render draggable grid
    private _fillGrid(widgets: GridConfigWidget[]): void {
        const grid: GridComponent | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        widgets.forEach((widget: GridConfigWidget) => {
            let card: CardComponent = new CardComponent();
            this._setWidgetAttribute(card, widget.attributes);
            this._setWidgetSlot(card, widget.slots);
            grid.appendChild(card);
        });
    }

    private _setWidgetAttribute(card: CardComponent, attributes: any): void {
        for (const key in attributes) {
            card.setAttribute(key, attributes[key]);
        }
    }

    private _setWidgetSlot(card: CardComponent, slots: GridConfigWidgetSlot[]): void {
        slots.forEach((slot: GridConfigWidgetSlot) => {
            const element: HTMLElement = document.createElement(slot.tag);
            element.innerHTML = slot.content;
            element.setAttribute('slot', slot.name);

            for (const key in slot.attributes) {
                element.setAttribute(key, slot.attributes[key]);
            }

            card.appendChild(element);
        });
    }

    private _getGridContent(): any[] {
        const grid: GridComponent | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return [];

        const widgetNodes: HTMLElement[] = Array.from(grid.querySelectorAll('ettdash-card'));

        const widgets: GridConfigWidget[] = widgetNodes.map((node: HTMLElement) => {
            const widget: GridConfigWidget = {
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

    // Render widget creation icons
    private _renderWidgetIcons() {
        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        if (!dashboard) return;

        const icons: WidgetIconsComponent = new WidgetIconsComponent();
        const config: AppConfig | null = ConfigService.instance.appConfig;
        if (!config) return;

        const prop: WidgetIcon[] = config.widgets.map((widget: AppConfigWidget) => ({ tag: widget.tag, url: widget.icon }));
        icons.widgetIcons = prop;
        icons.classList.add('widget-icons');
        dashboard.appendChild(icons);
    }

    private _setupWidgetIcons(): void {
        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        const icons: NodeListOf<HTMLElement> = this.shadowRoot.querySelectorAll('ettdash-widget-icons>*');

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

        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
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
        // console.log(event.dataTransfer);
        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        const tag: string | undefined = event.dataTransfer?.getData('text/plain');
        if (!tag) return;

        const widgetData: AppConfigWidget | null = this._getWidgetData(tag);
        if (!widgetData) return;

        this._openDialog();
        this._createWizardForm(widgetData.wizard);

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

    private _getWidgetData(tag: string): AppConfigWidget | null {
        const config: AppConfig | null = ConfigService.instance.appConfig;
        if (!config) return null;

        const widget: AppConfigWidget | undefined = config.widgets.find((w: AppConfigWidget) => w.tag === tag);
        return widget ? widget : null;
    }

    private _openDialog(): void {
        const dialog: HTMLDialogElement | null = this.shadowRoot.querySelector('.dialog');
        if (!dialog) return;
        dialog.innerHTML = '';
        dialog.showModal();
    }

    private _createWizardForm(widgetData: WizardItem[]): void {
        const dialog: HTMLDialogElement | null = this.shadowRoot.querySelector('.dialog');
        if (!dialog) return;

        const form: WizardFormComponent = new WizardFormComponent();
        form.wizardItems = widgetData;
        dialog.appendChild(form);
    }

    private _handleWizardFormSubmit(e: Event) {
        e.stopPropagation();
        const event: CustomEvent = e as CustomEvent;
        if (event.detail instanceof FormData) {
            const formData: FormData = event.detail;
            for (const value of formData.entries()) {
                console.log(value);                
            }
        }
    }

    private _addWidget(data: AppConfigWidget): void {
        const card: CardComponent = new CardComponent();
        for (const key in data.cardAttributes) {
            card.setAttribute(key, data.cardAttributes[key]);
        }
        const el: HTMLElement = document.createElement(data.tag);
        el.setAttribute('slot', 'content');
        for (const key in data.widgetAttributes) {
            el.setAttribute(key, data.widgetAttributes[key]);
        }
        card.appendChild(el);
        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;
        grid.appendChild(card);
    }
}

customElements.define('page-dashboard', DashboardPage);