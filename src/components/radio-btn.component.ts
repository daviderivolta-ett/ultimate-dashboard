const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <label class="radio" for="radio">
        <input class="radio__input" type="radio" id="radio" name="radio">
        <slot name="radio-icon" class="radio__icon"></slot>
        <span class="radio__label"></span>
    </label>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .radio {
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
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
        padding: 2px;
        box-sizing: border-box;
        color: white;
        border-radius: 4px;
        transition: .2s ease-in-out;
    }

    .radio__icon--hidden {
        display: none;
    }

    .radio__icon--checked {
        background-color: white;
        color: black;
        transition: .2s ease-in-out;
    }
    `
    ;

export default class RadioButtonComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    private _value: string = '';
    private _name: string = '';
    private _label: string = '';
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

    public get label(): string { return this._label }
    public set label(value: string) {
        this._label = value;
        this._updateLabel();
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

    public disconnectedCallback(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.removeEventListener('change', this._handleChange);

        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="radio-icon"]');
        if (slot) slot.removeEventListener('slotchange', this._handleIconSlot);
    }

    static observedAttributes: string[] = ['value', 'name', 'label'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'value') this.value = newValue;
        if (name === 'name') this.name = newValue;
        if (name === 'label') this.label = newValue;
    }

    private _render(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) this.input = input;
        this._handleIconSlot();
        // this._updateInputValue();
        // this._updateInputName();
    }

    private _updateInputValue(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.value = this.value;
    }

    private _updateInputName(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.name = this.name;
    }

    private _updateLabel(): void {
        const label = this.shadowRoot.querySelector('.radio__label');
        if (label) label.innerHTML = this.label;
    }

    private _setup(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.addEventListener('change', this._handleChange);

        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="radio-icon"]');
        if (slot) slot.addEventListener('slotchange', this._handleIconSlot);
    }

    private _handleChange = (): void => {
        this.checked = true;
        this.dispatchEvent(new CustomEvent('radio-change', { detail: this.value }));
    }

    private _handleIconSlot = (): void => {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot[name="radio-icon"]');
        if (!slot) return;

        slot.assignedNodes().length === 0 ? slot.classList.add('radio__icon--hidden') : slot.classList.remove('radio__icon--hidden');
    }
}

customElements.define('radio-button', RadioButtonComponent);