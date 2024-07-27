import { WidgetSize } from '../models/widget-size.model';
import './tooltip.component';
import './widget-tools.component';
import { WidgetToolsComponent } from './widget-tools.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <app-tooltip>
        <app-widget-tools slot="content"></app-widget-tools>
    </app-tooltip>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            position: relative;
            border: 1px solid crimson;
            border-radius: 8px;
            background-color: azure;
            width: 100%;
            aspect-ratio: 1 / 1;
        }

        :host(.square-small) {
            grid-row: span 1;
            grid-column: span 1;
            aspect-ratio: 1 / 1;
        }

        :host(.square-large) {
            grid-row: span 2;
            grid-column: span 2;
            aspect-ratio: 1 / 1;
        }

        :host(.row-small) {
            grid-row: span 1;
            grid-column: span 3;
            aspect-ratio: unset;
        }

        :host(.row-large) {
            grid-row: span 2;
            grid-column: span 3;
            aspect-ratio: unset;
        }


        :host(.column-small) {
            grid-row: span 3;
            grid-column: span 1;
            aspect-ratio: unset;
        }

        :host(.column-large) {
            grid-row: span 3;
            grid-column: span 2;
            aspect-ratio: unset;
        }

    `
    ;

export default class WidgetComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {
        this.render();
        this.setup();
    }

    private render(): void { }

    private setup(): void {
        const tools: WidgetToolsComponent | null = this.shadowRoot.querySelector('app-widget-tools');
        tools?.addEventListener('widget-resized', this.handleWidgetResize.bind(this));
    }

    private handleWidgetResize(e: Event) {
        const event: CustomEvent = e as CustomEvent;
        this.resizeWidget(event.detail.size);
    }

    private resizeWidget(size: string): void {
        this.resetSize();
        this.classList.add(size);
    }

    private resetSize(): void {
        this.classList.remove(...Object.values(WidgetSize));
    }

    public disconnectedCallback(): void {
        const tools = this.shadowRoot.querySelector('app-tooltip');
        if (tools) tools.removeEventListener('widget-resized', this.handleWidgetResize.bind(this));

    }
}

customElements.define('app-widget', WidgetComponent);