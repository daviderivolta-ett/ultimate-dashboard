// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="expandable-list">
        <button type="button" class="toggle">
            <slot name="button-icon"></slot>
            <slot name="button-label"></slot>
            <span class="toggle__arrow toggle__arrow--hidden">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"/>
                </svg>
            </span>
        </button>
        <div class="panel">
            <slot name="panel-content"></slot>
        </div>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .expandable-list {
        position: relative;
        width: fit-content;
    }

    .toggle {
        cursor: pointer;
        font-family: "Inter", sans-serif;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        color: var(--button-default-fg-color-rest);
        background-color: var(--button-default-bg-color-rest);
        border: 1px solid var(--button-default-border-color-rest);
        border-radius: var(--border-radius-small);

        &:hover {
            color: var(--button-default-fg-color-hover);
            background-color: var(--button-default-bg-color-hover);
            border-color: var(--button-default-border-color-hover);
        }
    }

    .toggle__arrow {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .toggle__arrow--hidden {
        display: none;
    }

    .toggle__arrow--open {
        transform: rotate(180deg);
    }

    .panel {
        position: absolute;
        left: 50%;
        z-index: 999;
        transform: translateX(-50%);
        margin: 16px 0 0 0;
        width: 200px;
        display: none;
        box-sizing: border-box;
        padding: 16px;
        background-color: var(--bg-color-default);
        border: 1px solid var(--border-color-default);
        border-radius: var(--border-radius);
    }

    .panel--open {
        display: flex;
        flex-direction: column;
    }
    `
    ;

// Component
export default class ExpandableListComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _isOpen: boolean = false;
    private _showArrow: boolean = false;


    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get isOpen(): boolean { return this._isOpen }
    public set isOpen(value: boolean) {
        this._isOpen = value;
        value ? this._openPanel() : this._closePanel();
    }

    public get showArrow(): boolean { return this._showArrow }
    public set showArrow(value: boolean) {
        this._showArrow = value;
        value ? this._showArrowIcon() : this._hideArrowIcon();
    }

    // Component callbacks
    public connectedCallback(): void {
        this._setup();
    }

    public disconnectedCallback(): void {
        const btn = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.removeEventListener('click', this._onToggleClick);
        document.removeEventListener('click', this._onDocumentClick);
    }

    static observedAttributes: string[] = ['show-arrow'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'show-arrow' && (newValue === 'true' || newValue === 'false')) {        
            newValue === 'true' ? this.showArrow = true : this.showArrow = false;
        }
    }

    private _setup(): void {
        const btn = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.addEventListener('click', this._onToggleClick);
        document.addEventListener('click', this._onDocumentClick);
    }

    // Methods
    private _onToggleClick = (event: Event): void => {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    private _onDocumentClick = (event: MouseEvent): void => { 
        const component = this.shadowRoot.querySelector('.expandable-list');
        if (component && !component.contains(event.target as Node)) {
            this.isOpen = false;
        }
    }

    private _openPanel(): void {
        const panel: HTMLDivElement | null = this.shadowRoot.querySelector('.panel');
        if (panel) panel.classList.add('panel--open');
        const icon: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (icon) icon.classList.add('toggle__arrow--open');
    }

    private _closePanel(): void {
        const panel: HTMLDivElement | null = this.shadowRoot.querySelector('.panel');
        if (panel) panel.classList.remove('panel--open');
        const icon: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (icon) icon.classList.remove('toggle__arrow--open');
    }

    private _showArrowIcon(): void {
        const arrow: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (arrow) arrow.classList.remove('toggle__arrow--hidden');
    }

    private _hideArrowIcon(): void {
        const arrow: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (arrow) arrow.classList.add('toggle__arrow--hidden');
    }
}

customElements.define('expandable-list', ExpandableListComponent);