import { WidgetSize } from '../models/widget-size.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="widget">
    <div class="draggable">
        <span class="draggable__icon">
            <svg xmlns="http://www.w3.org/2000/svg" id="drag-indicator" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path id="drag-indicator" fill="currentColor" d="M349.91-160q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm-260-250q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm-260-250q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Z"/>
            </svg>
        </span>
    </div>
    <app-tooltip>
        <radio-group name="size"></radio-group>
    </app-tooltip>
    <slot></slot>
    </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .widget {
        width: 100%;
        height: 100%;
        padding: 4%;
        box-sizing: border-box;
    }

    .widget--fullwidth {
        padding: 0;
    }

    :host {
        position: relative;
        border-radius: 8px;
        background-color: var(--bg-color-default);
        width: 100%;
        height: auto;
        aspect-ratio: 1 / 1;
        box-sizing: border-box;
        filter: drop-shadow(0 0 4px rgba(0, 0, 0, .05));
    }

    .draggable {
        position: absolute;
        top: 8px;
        right: 8px;
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
        color: var(--button-invisible-icon-color-rest);
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
    private _isFullWidth: boolean = false;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get size(): WidgetSize { return this._size }
    public set size(value: WidgetSize) { this._size = value }

    public get isFullWidth(): boolean { return this._isFullWidth }
    public set isFullWidth(value: boolean) {
        this._isFullWidth = value;       
        this._handleFullWidth(value);
    }

    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    static observedAttributes: string[] = ['is-fullwidth'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {        
        if (name === 'is-fullwidth' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.isFullWidth = true : this.isFullWidth = false;
        }
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
            radioButton.iconUrl = `/icons/${size}.svg#${size}`;
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

    private _handleFullWidth(value: boolean): void {
        console.log(value);                
        const widget: HTMLDivElement | null = this.shadowRoot.querySelector('.widget');
        if (!widget) return;
        value === true ? widget.classList.add('widget--fullwidth') : widget.classList.remove('widget--fullwidth');
    }
}

customElements.define('app-widget', WidgetComponent);