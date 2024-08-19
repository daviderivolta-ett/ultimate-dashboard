import '../components/grid.component';
import GridComponent from '../components/grid.component';
import CardComponent from '../components/card.component';
import { AppConfig, AppConfigWidget, GridConfig, GridConfigWidget, GridConfigWidgetSlot } from '../models/config.model';
import { ConfigService } from '../services/config.service';
import { WidgetIcon, WidgetIconsComponent } from '../components/widget-icons.component';
import WizardFormComponent from '../components/form.component';
import RadioGroupComponent from '../components/radio-group.component';
import RadioButtonComponent from '../components/radio-btn.component';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="dashboard">
        <navigation-topbar>
            <expandable-list slot="topbar-menu" class="change-grid-layout-button">
                <span slot="button-label">Test</span>
                <span slot="panel-content">PIPPO</span>
            </expandable-list>
            <expandable-list slot="topbar-menu" class="change-grid-layout-button" show-arrow="true">
                <span slot="button-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path fill="currentColor" d="M200-520q-24.54 0-42.27-17.73Q140-555.46 140-580v-180q0-24.54 17.73-42.27Q175.46-820 200-820h180q24.54 0 42.27 17.73Q440-784.54 440-760v180q0 24.54-17.73 42.27Q404.54-520 380-520H200Zm0 380q-24.54 0-42.27-17.73Q140-175.46 140-200v-180q0-24.54 17.73-42.27Q175.46-440 200-440h180q24.54 0 42.27 17.73Q440-404.54 440-380v180q0 24.54-17.73 42.27Q404.54-140 380-140H200Zm380-380q-24.54 0-42.27-17.73Q520-555.46 520-580v-180q0-24.54 17.73-42.27Q555.46-820 580-820h180q24.54 0 42.27 17.73Q820-784.54 820-760v180q0 24.54-17.73 42.27Q784.54-520 760-520H580Zm0 380q-24.54 0-42.27-17.73Q520-175.46 520-200v-180q0-24.54 17.73-42.27Q555.46-440 580-440h180q24.54 0 42.27 17.73Q820-404.54 820-380v180q0 24.54-17.73 42.27Q784.54-140 760-140H580ZM200-580h180v-180H200v180Zm380 0h180v-180H580v180Zm0 380h180v-180H580v180Zm-380 0h180v-180H200v180Zm380-380Zm0 200Zm-200 0Zm0-200Z"/>
                    </svg>
                </span>
                <span slot="button-label">Grid</span>
                <radio-group slot="panel-content" name="grid-config" layout-orientation="vertical"></radio-group>
            </expandable-list>
        </navigation-topbar>
        <div class="grid">
            <draggable-grid></draggable-grid>
        </div>
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
        min-height: 100dvh;
    }

    .grid {
        padding: 16px;
    }

    .widget-icons {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999;
    }

    .dialog {
        background-color: var(--bg-color-default);
        border-radius: var(--border-radius);
        padding: 32px;
        box-sizing: border-box;
        border: 1px solid var(--border-color-default);
        max-height: 100dvh;
        width: 350px;
        transition: display .2s allow-discrete, overlay .2s allow-discrete;      
        animation: bounce-out .2s forwards;
        &[open] {
            animation: bounce-in .2s forwards;
        }
    }

    .dialog::backdrop {
        background-color: var(--overlay-bg-color);
        backdrop-filter: var(--bg-blur-default);
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

    @media screen and (max-width: 576px) {
        .dialog {
            width: 92%;
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
        // console.log('App config', appConfig);        

        // console.log('All grid configs', allGridConfigs);
        // const gridConfig: GridConfig = await ConfigService.instance.getGridConfig();
        // console.log('Grid config', gridConfig);

        let gridConfig: GridConfig | null = ConfigService.instance.getCustomGridConfig();
        if (!gridConfig) gridConfig = await ConfigService.instance.getGridConfig();
        ConfigService.instance.gridConfig = gridConfig;

        this._render();
        this._setup();
        this._fillGrid(gridConfig.grid);
    }

    public disconnectedCallback(): void {
        this._removeEventListeners();
    }

    private _render(): void {
        this._renderChangeGridLayoutButton();
        this._renderWidgetIcons();
    }

    private async _reload(id: string): Promise<void> {
        this._removeEventListeners();
        const gridConfig: GridConfig = await ConfigService.instance.getGridConfig(id);
        this._setup();
        this._fillGrid(gridConfig.grid);
    }

    private _setup(): void {
        this._configAutosave = setInterval(this._handleGridChange, 5000);
        this._setupWidgetIcons();
        this.addEventListener('form-submit', this._handleWizardFormSubmit);
        this.addEventListener('grid-config-change', this._handleGridConfigChange);
    }

    private _removeEventListeners(): void {
        clearInterval(this._configAutosave);
        const dashboard: HTMLElement | null = this.shadowRoot.querySelector('.dashboard');
        if (dashboard) {
            dashboard.removeEventListener('dragover', this._handleGridDragOver);
            dashboard.removeEventListener('drop', this._handleGridDrop);
        }
        this.removeEventListener('form-submit', this._handleWizardFormSubmit);
        this.removeEventListener('grid-config-change', this._handleGridConfigChange);
    }

    // Methods
    // Change grid layout
    private _handleGridConfigChange = (event: Event): void => {
        const e: CustomEvent = event as CustomEvent;
        this._reload(e.detail);
    }

    // Render draggable grid
    private _fillGrid(widgets: GridConfigWidget[]): void {
        const grid: GridComponent | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        grid.innerHTML = '';

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

    private _setWidgetSlot(card: HTMLElement, slots: GridConfigWidgetSlot[]): void {
        slots.forEach((slot: GridConfigWidgetSlot) => {
            const element: HTMLElement = document.createElement(slot.tag);
            element.innerHTML = slot.content;
            element.setAttribute('slot', slot.name);

            for (const key in slot.attributes) {
                element.setAttribute(key, slot.attributes[key]);
            }

            card.appendChild(element);

            if (slot.slots && slot.slots.length > 0) {
                this._setWidgetSlot(element, slot.slots);
            }

        });
    }

    private _getGridContent(): any[] {
        const grid: GridComponent | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return [];

        const widgetNodes: HTMLElement[] = Array.from(grid.querySelectorAll('ettdash-card'));

        const widgets: GridConfigWidget[] = widgetNodes.map((node: HTMLElement) => {
            const widget: GridConfigWidget = {
                attributes: this._getNodeAttributes(node),
                slots: this._getSlotContent(node)
            };
            return widget;
        });

        return widgets;
    }

    private _getSlotContent(node: HTMLElement): any[] {
        const slots: any[] = [];
        const children: HTMLElement[] = Array.from(node.children) as HTMLElement[];

        children.forEach((child: HTMLElement) => {
            const slot: any = {};
            slot.name = child.slot;
            slot.tag = child.tagName;
            slot.attributes = this._getNodeAttributes(child);
            slot.content = this._getDirectTextContent(child);
            slot.slots = this._getSlotContent(child);
            slots.push(slot);
        });

        return slots;
    }

    private _getDirectTextContent(node: HTMLElement): string {
        let textContent = '';
        node.childNodes.forEach((childNode: ChildNode) => {

            if (childNode.nodeType === Node.TEXT_NODE) {
                textContent += childNode.textContent;
            }
        });
        return textContent.trim();
    }

    private _getNodeAttributes(node: HTMLElement): Record<string, any> {
        return Array.from(node.attributes).reduce((acc, attr) => {
            if (attr.name !== 'is-draggable') {
                acc[attr.name] = attr.value;
            }
            return acc;
        }, {} as { [key: string]: string });
    }

    private _handleGridChange = (): void => {
        const widgets: any[] = this._getGridContent();
        const config = new GridConfig();
        config.id = 'custom';
        config.label = 'Custom';
        config.grid = [...widgets];
        ConfigService.instance.gridConfig = config;
    }

    // Render change grid layout button
    private async _renderChangeGridLayoutButton(): Promise<void> {
        const radioGroup: RadioGroupComponent | null = this.shadowRoot.querySelector('radio-group[slot="panel-content"]');
        if (!radioGroup) return;

        const allGridConfigs: GridConfig[] = await ConfigService.instance.getAllGridConfigs();
        allGridConfigs.forEach((config: GridConfig) => {
            const radioButton: RadioButtonComponent = new RadioButtonComponent();

            radioButton.value = config.id;
            radioButton.name = 'grid-config';
            radioButton.label = config.label;

            fetch(config.icon)
                .then((res: Response) => res.text())
                .then((iconString: string) => {
                    const icon = document.createElement('span');
                    icon.setAttribute('slot', 'radio-icon');
                    icon.innerHTML = iconString;
                    radioButton.appendChild(icon);
                })
                .catch(() => { throw new Error('Icon not found') })

            radioGroup.appendChild(radioButton);
        });
    }

    // Render widget creation icons
    private _renderWidgetIcons(): void {
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
            dashboard.addEventListener('dragover', this._handleGridDragOver);
            dashboard.addEventListener('drop', this._handleGridDrop);

            icons.forEach((icon: HTMLElement) => icon.addEventListener('dragstart', this._handleIconDragStart))
        }
    }

    private _handleIconDragStart = (event: DragEvent): void => {
        const target = event.target as HTMLElement;
        if (target && target.id) {
            const id: string | undefined = target.id.split('#').pop();
            if (id) event.dataTransfer?.setData('text/plain', id);
        }
    }

    private _handleGridDragOver = (event: DragEvent): void => {
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

    private _handleGridDrop = (event: DragEvent): void => {
        // console.log(event.dataTransfer);
        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        const tag: string | undefined = event.dataTransfer?.getData('text/plain');
        if (!tag) return;

        const widgetData: AppConfigWidget | null = this._getWidgetData(tag);
        if (!widgetData) return;

        this._openDialog();
        this._createWizardForm(widgetData);
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

    private _createWizardForm(widgetData: AppConfigWidget): void {
        const dialog: HTMLDialogElement | null = this.shadowRoot.querySelector('.dialog');
        if (!dialog) return;

        const form: WizardFormComponent = new WizardFormComponent();
        form.widget = widgetData;
        dialog.appendChild(form);
    }

    private _handleWizardFormSubmit = (e: Event) => {
        e.stopPropagation();

        const dialog: HTMLDialogElement | null = this.shadowRoot.querySelector('dialog');
        if (dialog) dialog.close();

        const event: CustomEvent = e as CustomEvent;
        const widgetData: GridConfigWidget = event.detail;
        this._addWidget(widgetData);
    }

    private _addWidget(data: GridConfigWidget): void {
        const card: CardComponent = new CardComponent();

        for (const key in data.attributes) {
            card.setAttribute(key, data.attributes[key]);
        }

        this._addSlots(card, data.slots);

        const grid: HTMLElement | null = this.shadowRoot.querySelector('draggable-grid');
        if (!grid) return;

        grid.appendChild(card);
    }

    private _addSlots(parentEl: HTMLElement, slots: GridConfigWidgetSlot[]) {
        slots.forEach((slot: GridConfigWidgetSlot) => {
            const el: HTMLElement = document.createElement(slot.tag);
            el.setAttribute('slot', slot.name);
            el.innerHTML = slot.content;
            for (const key in slot.attributes) {
                el.setAttribute(key, slot.attributes[key]);
            }
            parentEl.appendChild(el);
            if (slot.slots && slot.slots.length > 0) {
                this._addSlots(el, slot.slots);
            }
        });
    }
}

customElements.define('page-dashboard', DashboardPage);