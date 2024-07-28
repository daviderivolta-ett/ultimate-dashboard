const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <label for="radio">
        <input type="radio" id="radio" name="radio">
        <span>Label</span>
    </label>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        .icon {
            display: block;
            width: 24px;
            height: 24px;
            background: url('/icons/close.svg') no-repeat center / contain;
            filter: invert(22%) sepia(100%) saturate(7485%) hue-rotate(320deg) brightness(106%) contrast(104%);
        }
    `
    ;

export default class RadioButton extends HTMLElement {
    public shadowRoot: ShadowRoot;

    private _value: string = '';
    private _name: string = '';
    private _label: string = '';
    private _iconUrl: string = '';

    public input: HTMLInputElement = document.createElement('input');

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get value(): string { return this._value }
    public set value(value: string) { this._value = value }

    public get name(): string { return this._name }
    public set name(value: string) { this._name = value }

    public get label(): string { return this._label }
    public set label(value: string) { this._label = value }

    public get iconUrl(): string { return this._iconUrl }
    public set iconUrl(value: string) { this._iconUrl = value }

    get checked(): boolean { return this.input.checked }
    set checked(value: boolean) { this.input.checked = value }

    public connectedCallback(): void {
        this.getCustomAttributes();
        this.render();
        this.setup();
    }

    private getCustomAttributes(): void {
        const value: string | null = this.getAttribute('value');
        const name: string | null = this.getAttribute('name');
        const label: string | null = this.getAttribute('label');

        if (value) this.value = value;
        if (name) this.name = name;
        if (label) this.label = label;
    }

    private render(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        const label: HTMLSpanElement | null = this.shadowRoot.querySelector('span');

        if (input) {
            input.value = this.value;
            input.name = this.name;
            this.input = input;
        }

        if (label) label.innerHTML = this.label;
    }

    private setup(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('input');
        if (input) input.addEventListener('change', this.handleChange.bind(this));
    }

    private handleChange(): void {
        this.dispatchEvent(new CustomEvent('radio-change', { detail: this.value }));
    }
}

customElements.define('radio-button', RadioButton);