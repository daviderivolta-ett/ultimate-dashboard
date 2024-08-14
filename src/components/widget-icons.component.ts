export interface WidgetIcon {
    tag: string;
    url: string;
}

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="component">
        <ul class="list">
            <slot name="list"></slot>
        </ul>
        <button type="button" class="toggle-btn">
            <span class="toggle-btn__icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"/>
                </svg>
            </span>
        </button>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .component {
        display: flex;
        align-items: center;
    }

    .toggle-btn {
        cursor: pointer;
        width: 40px;
        height: 40px;
        padding: 8px;
        color_ var(--button-white-fg-color-rest);
        background-color: var(--button-white-bg-color-rest);
        border: 1px solid var(--button-white-border-color-rest);
        border-radius: var(--border-radius);
    }

    .toggle-btn__icon {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .list {
        opacity: 0;
        background-color: var(--bg-color-default);
        height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: .2s ease-in-out;
        transform-origin: right;
        margin: 0;
        list-style-type: none;
        padding: 0px 16px;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color-default);
        box-sizing: border-box;
    }
    
    .list--visible {
        opacity: 1;
        transition: .2s ease-in-out;
        margin: 0 8px 0 0;
    }

    ::slotted(.list__el) {
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 8px;
    }
    `
    ;

export class WidgetIconsComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _isOpen: boolean = false;

    private _widgetIcons: WidgetIcon[] = [];

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get isOpen(): boolean { return this._isOpen }
    public set isOpen(value: boolean) {
        this._isOpen = value;
        this._toggleVisibility();
    }

    public get widgetIcons(): WidgetIcon[] { return this._widgetIcons }
    public set widgetIcons(value: WidgetIcon[]) { this._widgetIcons = value }

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    public disconnectedCallback(): void {
        const toggle: HTMLButtonElement | null = this.shadowRoot.querySelector('.toggle-btn');
        if (toggle) toggle.removeEventListener('click', this._onToggleBtnClick);
        document.removeEventListener('click', this._onDocumentClick);
    }

    private _render(): void {
        this._widgetIcons.forEach((icon: WidgetIcon) => {
            const el: HTMLLIElement = document.createElement('li');
            el.classList.add('list__el')
            el.id = `widget-icon#${icon.tag}`;
            const img = document.createElement('img');
            img.src = icon.url;
            img.setAttribute('draggable', 'false');
            el.appendChild(img);
            el.setAttribute('draggable', 'true');
            el.setAttribute('slot', 'list');
            this.appendChild(el);
        });
    }

    private _setup(): void {
        const toggle: HTMLButtonElement | null = this.shadowRoot.querySelector('.toggle-btn');
        if (toggle) toggle.addEventListener('click', this._onToggleBtnClick);
        document.addEventListener('click', this._onDocumentClick);
    }

    static observedAttributes: string[] = ['is-open'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'is-open' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.isOpen = true : this.isOpen = false;
        }
    }

    // Methods
    private _onToggleBtnClick = (event: MouseEvent): void => {
        event.stopPropagation();
        const isOpenAttr: string | null = this.getAttribute('is-open');
        !isOpenAttr || isOpenAttr === 'false' ? this.setAttribute('is-open', 'true') : this.setAttribute('is-open', 'false');

    }

    private _onDocumentClick = (event: MouseEvent): void => { 
        const component = this.shadowRoot.querySelector('.component');
        if (component && !component.contains(event.target as Node)) {
            this.setAttribute('is-open', 'false');
        }
    }

    private _toggleVisibility(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('.list');
        if (!container) return;
        this.isOpen ? container.classList.add('list--visible') : container.classList.remove('list--visible');
    }
}

customElements.define('ettdash-widget-icons', WidgetIconsComponent);