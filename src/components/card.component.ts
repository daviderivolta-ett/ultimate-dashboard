import { WidgetSize } from '../models/widget.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="card">
        <icon-button class="delete-button">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path fill="currentColor" d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
            </svg>
        </icon-button>
        <div class="draggable">
            <span class="draggable__icon">
                <svg xmlns="http://www.w3.org/2000/svg" id="drag-indicator" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path id="drag-indicator" fill="currentColor" d="M349.91-160q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm-260-250q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm-260-250q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Zm260 0q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5Z"/>
                </svg>
            </span>
        </div>
        <hover-tooltip>
            <radio-group name="size"></radio-group>
        </hover-tooltip>
        <slot name="content"></slot>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .card {
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-color-default);
        border-radius: var(--border-radius);
        background-color: var(--bg-color-default);
    }

    .card--fullwidth {
        padding: 0;
    }

    .delete-button {
        opacity: 0;
        width: fit-content;
        position: absolute;
        z-index: 9;
        bottom: -10px;
        left: -10px;
        transition: .4s ease-in-out;
    }

    .delete-button--visible {
        opacity: 1;
        transition: .4s ease-in-out;
    }

    .draggable {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 99;
        cursor: grab;
        width: 32px;
        height: 32px;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color-default);
        border-radius: 8px;
    }

    .draggable__icon {
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--button-white-fg-color-rest);
        background-color: var(--button-white-bg-color-rest);
    }

    slot[name="content"] {
        display: block;
        flex-grow: 1;
    }
    `
    ;

// Component
export default class CardComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _size: WidgetSize = WidgetSize.SquareSm;

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
        this._toggleMinimal(value);
    }

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();
        window.addEventListener('resize', this._handleWindowResize.bind(this));
        this._toggleMinimal(this.size);
    }

    public disconnectedCallback(): void {
        this.removeEventListener('size-change', this._handleWidgetResize);
        this.removeEventListener('mouseover', this._handleMouseOver);
        this.removeEventListener('mouseout', this._handleMouseOut);
        this.removeEventListener('icon-btn-click', this._handleDeleteButtonClick);
    }

    static observedAttributes: string[] = ['size'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'size' && Object.values(WidgetSize).includes(newValue as WidgetSize)) {
            this.size = newValue as WidgetSize;
        }
    }

    private _render(): void {
        this._handleWindowResize();
    }

    private _setup(): void {
        this.addEventListener('size-change', this._handleWidgetResize);
        this.addEventListener('mouseover', this._handleMouseOver);
        this.addEventListener('mouseout', this._handleMouseOut);
        this.addEventListener('icon-btn-click', this._handleDeleteButtonClick);
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

            fetch(`/icons/${size}.svg`)
                .then((res: Response) => res.text())
                .then((iconString: string) => {
                    const icon = document.createElement('span');
                    icon.setAttribute('slot', 'radio-icon');
                    icon.innerHTML = iconString;
                    radioButton.appendChild(icon);
                })
                .catch(() => { throw new Error('Icon not found') })

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

    private _handleWidgetResize = (event: Event): void => {
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

    private _toggleMinimal(size: WidgetSize): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="content"]');
        if (!slot) return;
        const slottedElement: Element[] = slot.assignedElements();
        if (slottedElement.length === 0) return;
        const content: Element = slottedElement[0];
        size === WidgetSize.SquareSm ? content.setAttribute('is-minimal', 'true') : content.setAttribute('is-minimal', 'false');
    }

    private _handleMouseOver = (): void => {
        const deleteButton = this.shadowRoot.querySelector('.delete-button');
        if (deleteButton) deleteButton.classList.add('delete-button--visible');
    }

    private _handleMouseOut = (): void => {
        const deleteButton = this.shadowRoot.querySelector('.delete-button');
        if (deleteButton) deleteButton.classList.remove('delete-button--visible');
    }

    private _handleDeleteButtonClick = (e: Event): void => {
        e.stopPropagation();
        this.remove();
    }
}

customElements.define('ettdash-card', CardComponent);