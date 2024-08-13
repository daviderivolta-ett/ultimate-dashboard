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
                    <path fill="currentColor" d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
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
        background-color: white;
        border: none;
        border-radius: 100px;
        box-shadow: var(--shadow-resting-small);
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
        // transform: scaleX(0);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: .2s ease-in-out;
        transform-origin: right;
        margin: 0;
        list-style-type: none;
        padding: 0px 16px;
        border-radius: 100px;
        box-shadow: var(--shadow-resting-small);
        border: 1px solid white;
        box-sizing: border-box;
        backdrop-filter: blur(5px) saturate(2.5);
    }
    
    .list--visible {
        opacity: 1;
        transition: .2s ease-in-out;
        // transform: scaleX(1);
        margin: 0 16px 0 0;
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

    }

    private _render(): void {
        // this._widgets.forEach((widget: any) => {
        //     const el: HTMLLIElement = document.createElement('li');
        //     el.classList.add('list__el')
        //     el.id = `widget-icon#${widget.tag}`;
        //     el.innerHTML = widget.icon;
        //     el.setAttribute('draggable', 'true');
        //     el.setAttribute('slot', 'list');
        //     this.appendChild(el);
        // });

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
        if (toggle) toggle.addEventListener('click', this._onToggleBtnClick.bind(this));
    }

    static observedAttributes: string[] = ['is-open'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'is-open' && (newValue === 'true' || newValue === 'false')) {
            newValue === 'true' ? this.isOpen = true : this.isOpen = false;
        }
    }

    // Methods
    private _onToggleBtnClick() {
        const isOpenAttr: string | null = this.getAttribute('is-open');
        !isOpenAttr || isOpenAttr === 'false' ? this.setAttribute('is-open', 'true') : this.setAttribute('is-open', 'false');

    }

    private _toggleVisibility(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('.list');
        if (!container) return;
        this.isOpen ? container.classList.add('list--visible') : container.classList.remove('list--visible');
    }
}

customElements.define('ettdash-widget-icons', WidgetIconsComponent);