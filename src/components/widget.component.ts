import { WidgetSize } from '../models/widget-size.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';
import './tooltip.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="draggable">
        <span class="draggable__icon">
            <svg xmlns="http://www.w3.org/2000/svg" id="drag-indicator" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path id="drag-indicator" fill="currentColor" d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z"/>
            </svg>
        </span>
    </div>
    <app-tooltip>
        <radio-group name="size"></radio-group>
    </app-tooltip>
    <slot></slot>
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
        position: absolute;
        top: 0;
        right: 0;
        z-index: 99;
        cursor: grab;
        width: 40px;
        height: 40px;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .draggable__icon {
        color: black;
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