// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="select-group">
        <label for="label-select" class="select-group__label">
            <slot name="label">Label</slot>
        </label>
        <button type="button" class="toggle" role="combobox">
            <span class="toggle__selected-option">Seleziona un'opzione</span>
            <span class="toggle__arrow">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path fill="currentColor" d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"/>
                </svg>
            </span>
        </button>
        <ul class="select-group__list"></ul>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .select-group__label,
    .toggle {
        width: 100%;
    }

    .select-group__label {
        display: block;
        color: var(--fg-color-rest);
        font-size: 0.857rem;
        font-weight: 600;
        margin: 0 0 4px 0;
    }

    .toggle {
        cursor: pointer;
        font-family: "Inter", sans-serif;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--control-fg-color-rest);
        background-color: var(--control-bg-color-rest);
        border: 1px solid var(--control-border-color-rest);
        border-radius: 4px;
        padding: 8px;
        box-sizing: border-box;
        height: 40px;
        transition: .2s ease-in-out;

        &:hover {
            box-shadow: 0 0 0 4px var(--focus-shadow-color);
        }

        &:focus {
            outline: 1px solid var(--focus-outline-color);
            box-shadow: 0 0 0 4px var(--focus-shadow-color);
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

    .select-group__list {
        display: none;
        padding: 0;
        list-style-type: none;
        border: 1px solid var(--border-color-default);
        border-radius: 4px;
        margin: 8px 0;
    }

    .select-group__list--open {
        display: block;
    }

    .select-item {
        position: relative;
    }

    .select-item__label {
        display: block;
        padding: 8px;

        &:hover {
            cursor: pointer;
            background-color: var(--control-bg-color-hover);
        }
    }

    .select-item__radio {
        position: absolute;
        width: 0;
        height: 0;
        visibility: hidden;
        opacity: 0;
    }
    `
    ;

// Component
export class LabelSelect extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _internals: ElementInternals;
    public static formAssociated: boolean = true;

    private _isOpen: boolean = false;
    private _name: string = '';
    private _value: string = '';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });
        this._internals = this.attachInternals();

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get form(): HTMLFormElement | null { return this._internals.form }

    public get name(): string { return this._name }
    public set name(value: string) {
        this._name = value;
        this._internals.setFormValue(this._value, value);
    }

    public get value(): string { return this._value }
    public set value(value: string) {
        this._value = value;
        this._internals.setFormValue(value);
    }

    public get isOpen(): boolean { return this._isOpen }
    public set isOpen(value: boolean) {
        this._isOpen = value;
        value ? this._showList() : this._hideList();
    }

    // Component callbacks
    public connectedCallback(): void {
        this._setup();
    }

    public disconnectedCallback(): void {
        const btn = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.removeEventListener('click', this._onToggleClick);

        const list: HTMLUListElement | null = this.shadowRoot.querySelector('.select-group__list');
        if (list) list.removeEventListener('change', this._onSelect);
    }

    static observedAttributes: string[] = ['name'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'name') this.name = newValue;
    }

    private _setup(): void {
        const btn: HTMLButtonElement | null = this.shadowRoot.querySelector('.toggle');
        if (btn) btn.addEventListener('click', this._onToggleClick);

        const list: HTMLUListElement | null = this.shadowRoot.querySelector('.select-group__list');
        if (list) list.addEventListener('change', this._onSelect);

        this._handleSlot();
    }

    // Methods
    private _onToggleClick = (event: Event): void => {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    private _showList(): void {
        const list: HTMLUListElement | null = this.shadowRoot.querySelector('.select-group__list');
        if (list) list.classList.add('select-group__list--open');
        const icon: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (icon) icon.classList.add('toggle__arrow--open');
    }

    private _hideList(): void {
        const list: HTMLUListElement | null = this.shadowRoot.querySelector('.select-group__list');
        if (list) list.classList.remove('select-group__list--open');
        const icon: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__arrow');
        if (icon) icon.classList.remove('toggle__arrow--open');
    }

    private _onSelect = (event: Event): void => {
        const target = event.target as HTMLInputElement;

        if (target && target.matches('.select-item__radio')) {
            event.stopPropagation();
            const labelElement = this.shadowRoot.querySelector(`label[for="${target.id}"]`);

            const toggleLabel: HTMLSpanElement | null = this.shadowRoot.querySelector('.toggle__selected-option');
            if (toggleLabel && labelElement) {
                toggleLabel.innerHTML = labelElement.textContent ? labelElement.textContent : 'Seleziona un\'opzione';
            }
           
            this.value = target.value;
            this.isOpen = false;
        }
    }

    private _handleSlot(): void {
        const list = this.shadowRoot.querySelector('.select-group__list');
        if (!list) return;

        const items: NodeListOf<HTMLElement> = this.querySelectorAll('*[slot="select"]');
        items.forEach((item: HTMLElement) => {
            const label: string | null = item.textContent;
            const value: string | null = item.getAttribute('value');

            if (!value) return;

            const parsedValue: string = this._parseObjectValue(value);            
            const id: string = this._generateId();

            const html =
                `
                <li role="option" class="select-item">
                    <input type="radio" id="${id}" value="${parsedValue}" name="radio" class="select-item__radio" />
                    <label for="${id}" class="select-item__label">${label}</label>
                </li>
                `

            const tempElement: HTMLDivElement = document.createElement('div');
            tempElement.innerHTML = html;
            const childNodes = Array.from(tempElement.childNodes);
            childNodes.forEach((node) => list.appendChild(node));
        });
    }

    private _parseObjectValue(value: string): string {
        try {
            const parsedValue = JSON.parse(value);
            return JSON.stringify(parsedValue).replace(/"/g, "'");
        } catch (error) {
            return value;
        }
    }

    private _generateId(): string {
        const letters: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let id: string = '';
        
        for (let i = 0; i < 10; i++) {
            const randomLetter: string = letters[Math.floor(Math.random() * letters.length)];
            id += randomLetter;
        }
    
        return id;
    }
    
}

customElements.define('label-select', LabelSelect);