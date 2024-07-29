const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <label class="radio" for="radio">
        <input class="radio__input" type="radio" id="radio" name="radio">
        <span class="radio__icon">
            <svg viewBox="0 0 24 24">
                <use href="/icons/square.svg#square"></use>
            </svg>
        </span>
    </label>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .radio {
        cursor: pointer;
    }

    .radio__input {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        opacity: 0;
    }

    .radio__icon {
        display: block;
        width: 24px;
        height: 24px;
        color: white;
        border-radius: 4px;
        transition: .2s ease-in-out;
    }

    .radio__icon--checked {
        background-color: white;
        color: black;
        transition: .2s ease-in-out;
    }
    `
    ;

export default class RadioButton extends HTMLElement {
    public shadowRoot: ShadowRoot;

    private _value: string = '';
    private _name: string = '';
    private _iconUrl: string = '/icons/square.svg#square';
    public input: HTMLInputElement = document.createElement('input');

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get value(): string { return this._value }
    public set value(value: string) {
        this._value = value;
        this._updateInputValue();
    }

    public get name(): string { return this._name }
    public set name(value: string) {
        this._name = value;
        this._updateInputName();
    }

    public get iconUrl(): string { return this._iconUrl }
    public set iconUrl(value: string) {
        this._iconUrl = value;
        this._updateIconUrl();
    }

    get checked(): boolean { return this.input.checked }
    set checked(value: boolean) {    
        this.input.checked = value;
        const icon: HTMLSpanElement | null = this.shadowRoot.querySelector('.radio__icon');
        if (icon) value ? icon.classList.add('radio__icon--checked') : icon.classList.remove('radio__icon--checked');
    }

    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    static observedAttributes: string[] = ['value', 'name', 'label', 'iconUrl'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'value') this.value = newValue;
        if (name === 'name') this.name = newValue;
        if (name === 'icon-url') this.iconUrl = newValue;
    }

    private _render(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) this.input = input;

        this._updateInputValue();
        this._updateInputName();
        this._updateIconUrl();
    }

    private _updateInputValue(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.value = this.value;
    }

    private _updateInputName(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.name = this.name;
    }

    private _updateIconUrl(): void {
        const icon: SVGUseElement | null = this.shadowRoot.querySelector('use');
        if (icon) icon.href.baseVal = this.iconUrl;
    }

    private _setup(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.addEventListener('change', this._handleChange.bind(this));
    }

    private _handleChange(): void {
        this.checked = true;
        this.dispatchEvent(new CustomEvent('radio-change', { detail: this.value }));
    }
}

customElements.define('radio-button', RadioButton);