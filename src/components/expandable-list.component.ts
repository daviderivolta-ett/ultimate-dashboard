// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="expandable-list">
        <button type="button" class="toggle">
            <slot name="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="M200-520q-24.54 0-42.27-17.73Q140-555.46 140-580v-180q0-24.54 17.73-42.27Q175.46-820 200-820h180q24.54 0 42.27 17.73Q440-784.54 440-760v180q0 24.54-17.73 42.27Q404.54-520 380-520H200Zm0 380q-24.54 0-42.27-17.73Q140-175.46 140-200v-180q0-24.54 17.73-42.27Q175.46-440 200-440h180q24.54 0 42.27 17.73Q440-404.54 440-380v180q0 24.54-17.73 42.27Q404.54-140 380-140H200Zm380-380q-24.54 0-42.27-17.73Q520-555.46 520-580v-180q0-24.54 17.73-42.27Q555.46-820 580-820h180q24.54 0 42.27 17.73Q820-784.54 820-760v180q0 24.54-17.73 42.27Q784.54-520 760-520H580Zm0 380q-24.54 0-42.27-17.73Q520-175.46 520-200v-180q0-24.54 17.73-42.27Q555.46-440 580-440h180q24.54 0 42.27 17.73Q820-404.54 820-380v180q0 24.54-17.73 42.27Q784.54-140 760-140H580ZM200-580h180v-180H200v180Zm380 0h180v-180H580v180Zm0 380h180v-180H580v180Zm-380 0h180v-180H200v180Zm380-380Zm0 200Zm-200 0Zm0-200Z"/>
                </svg>
            </slot>
            <slot name="button-label">Click me</slot>
            <span class="toggle__arrow">
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
    public _isOpen: boolean = false;

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

    // Component callbacks
    public connectedCallback(): void {
        this._setup();
    }

    public disconnectedCallback(): void {
        const btn = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.removeEventListener('click', this._onToggleClick);
    }

    static observedAttributes: string[] = [];
    public attributeChangedCallback(): void {

    }

    private _setup(): void {
        const btn = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.addEventListener('click', this._onToggleClick);
    }

    // Methods
    private _onToggleClick = (event: Event): void => {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
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
}

customElements.define('expandable-list', ExpandableListComponent);