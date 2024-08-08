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
        background-color: red;
        height: 40px;
        transform: scaleX(0);
        display: flex;
        align-items: center;
        transition: .2s ease-in-out;
        transform-origin: right;
        margin: 0;
        list-style-type: none;
        padding: 0;
    }
    
    .list--visible {
        opacity: 1;
        transition: .2s ease-in-out;
        transform: scaleX(1);
    }

    ::slotted(.list__el) {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
    }
    `
    ;

export class WidgetIcons extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _isOpen: boolean = false;
    private _widgets = [
        {
            tag: 'ettdash-line-chart',
            icon: `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"/>
                </svg>
            `
        },
        {
            tag: 'ettdash-map',
            icon: `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"/>
                </svg>
            `
        }
    ];

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

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    public disconnectedCallback(): void {

    }

    private _render(): void {
        this._widgets.forEach((widget: any) => {
            const el: HTMLLIElement = document.createElement('li');
            el.classList.add('list__el')
            el.id = `widget-icon#${widget.tag}`;
            el.innerHTML = widget.icon;
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

customElements.define('widget-icons', WidgetIcons);