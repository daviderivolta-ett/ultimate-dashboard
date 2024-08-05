import { WidgetSize } from '../models/widget.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';

// Template
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

        <div class="header">
            <slot name="title"></slot>
            <slot name="desc" class="header__desc--hidden"></slot>
        </div>
        <slot name="content"></slot>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .widget {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 4%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color-default);
        background-color: var(--bg-color-default);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    }

    slot[name="title"] {
        display: block;
        color: var(--fg-color-default);
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 .25rem 0;
    }

    slot[name="desc"] {
        display: block;
        color: var(--fg-color-muted);
        font-size: .85rem;
    }

    slot[name="content"] {
        display: block;
        flex-grow: 1;
    }

    .widget--fullwidth {
        padding: 0;
    }

    slot[name="desc"].header__desc--hidden {
        display: none;
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
    `
    ;

// Component
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
    public set size(value: WidgetSize) {
        this._size = value;
        this._resizeWidget(value);
        this._toggleDesc(value);
    }

    public get isFullWidth(): boolean { return this._isFullWidth }
    public set isFullWidth(value: boolean) {
        this._isFullWidth = value;
        this._handleFullWidth(value);
    }

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();

        window.addEventListener('resize', this._handleWindowResize.bind(this));
    }

    static observedAttributes: string[] = ['size', 'is-fullwidth'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'size' && Object.values(WidgetSize).includes(newValue as WidgetSize)) {
            this.size = newValue as WidgetSize;
        }

        if (name === 'is-fullwidth' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.isFullWidth = true : this.isFullWidth = false;
        }
    }

    private _render(): void {
        this._handleWindowResize();
    }

    private _setup(): void {
        this.addEventListener('size-change', this._handleWidgetResize.bind(this));
        this._handleSlots();
    }

    // Methods
    private _createResizeController(media: 'desktop' | 'tablet' | 'mobile' = 'desktop'): void {
        const radioGroup: RadioGroup | null = this.shadowRoot.querySelector('radio-group');
        if (!radioGroup) return;
        radioGroup.innerHTML = '';

        let validSizes: string[] = this._getValidSizes(media);

        if (!validSizes.includes(this.size)) this.size = WidgetSize.SquareSm;
        
        validSizes.forEach((size: string) => {
            const radioButton: RadioButton = new RadioButton();
            radioButton.iconUrl = `/icons/${size}.svg#${size}`;

            radioButton.value = size;
            radioButton.name = size;

            radioGroup.appendChild(radioButton);
            if (size === this.size) radioButton.checked = true;
        });
    }

    private _getValidSizes(media: 'desktop' | 'tablet' | 'mobile' = 'desktop'): string[] {
        let validSizes: string[] = [];
        switch (media) {
            case 'tablet':
                validSizes = ['square-small', 'square-large', 'column-small', 'column-large'];
                break;
            case 'mobile':
                validSizes = ['square-small', 'column-small'];
                break;
            default:
                validSizes = Object.values(WidgetSize);
                break;
        }
        return validSizes;
    }

    private _handleWindowResize(): void {
        if (window.innerWidth < 576) this._createResizeController('mobile');
        else if (window.innerWidth < 768 && window.innerWidth > 576) this._createResizeController('tablet');
        else this._createResizeController('desktop');
    }

    private _handleWidgetResize(event: Event): void {  
        const e: CustomEvent = event as CustomEvent;           
        this.setAttribute('size', e.detail);
        event.stopPropagation();
    }

    private _resizeWidget(size: WidgetSize): void {
        this._resetSize();
        this.classList.add(size);
    }

    private _resetSize(): void {
        this.classList.remove(...Object.values(WidgetSize));
    }

    private _handleFullWidth(value: boolean): void {
        const widget: HTMLDivElement | null = this.shadowRoot.querySelector('.widget');
        if (!widget) return;
        value === true ? widget.classList.add('widget--fullwidth') : widget.classList.remove('widget--fullwidth');
    }

    private _handleSlots(): void {
        const titleSlot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="title"]');
        const descSlot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="desc"]');

        if (titleSlot && titleSlot.assignedNodes().length === 0) titleSlot.style.display = 'none';
        if (descSlot && descSlot.assignedNodes().length === 0) descSlot.style.display = 'none';
    }

    private _toggleDesc(size: WidgetSize): void {
        const desc: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="desc"');
        if (!desc) return;
        size === WidgetSize.SquareSm ? desc.classList.add('header__desc--hidden') : desc.classList.remove('header__desc--hidden');
    }
}

customElements.define('app-widget', WidgetComponent);