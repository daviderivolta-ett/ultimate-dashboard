import { WidgetSize } from '../models/widget-size.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';
import './tooltip.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `   
        <div class="draggable"></div>
        <app-tooltip>
            <radio-group name="size"></radio-group>
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
            height: auto;
            aspect-ratio: 1 / 1;
            box-sizing: border-box;
        }

        .draggable {
            cursor: grab;
            height: 50px;
            background-color: red;
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
    private _size: WidgetSize = WidgetSize.SquareSm;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get size(): WidgetSize { return this._size }
    public set size(value: WidgetSize) { this._size = value }

    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    private _render(): void {
        this._createResizeController();
    }

    private _setup(): void {
        const resizeController: RadioGroup | null = this.shadowRoot.querySelector('radio-group');
        if (resizeController) resizeController.addEventListener('size-change', this._handleWidgetResize.bind(this));
    }

    private _createResizeController(): void {
        const radioGroup: RadioGroup | null = this.shadowRoot.querySelector('radio-group');
        if (!radioGroup) return;
        radioGroup.innerHTML = '';

        Object.values(WidgetSize).forEach((size: string) => {
            const radioButton: RadioButton = new RadioButton();
            radioButton.value = size;
            radioButton.name = size;
            radioButton.iconUrl = '/icons/square.svg#square';
            radioGroup.appendChild(radioButton);
            if (size === this.size) radioButton.checked = true;
        });
    }

    private _handleWidgetResize(event: Event) {
        const e: CustomEvent = event as CustomEvent;
        this.size = e.detail;
        this._resizeWidget(e.detail);
    }

    private _resizeWidget(size: string): void {
        this._resetSize();
        this.classList.add(size);
    }

    private _resetSize(): void {
        this.classList.remove(...Object.values(WidgetSize));
    }
}

customElements.define('app-widget', WidgetComponent);