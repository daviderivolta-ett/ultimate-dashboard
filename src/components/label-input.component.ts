const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="input-group">
        <label for="label-input" class="input-group__label"></label>
        <input id="label-input" class="input-group__input">
    </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .input-group__label,
    .input-group__input {
        display: block;
        width: 100%;
    }

    .input-group__label {
        color: var(--fg-color-rest);
        font-size: 0.857rem;
        font-weight: 600;
        margin: 0 0 4px 0;
    }

    .input-group__input {
        font-family: "Inter", sans-serif;
        font-size: 1rem;
        color: var(--control-fg-color-rest);
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
    `
    ;

export default class LabelInput extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _internals: ElementInternals;
    public static formAssociated: boolean = true;

    private _name: string = '';
    private _value: string = '';
    private _type: 'hidden' | 'text' | 'number' = 'hidden';
    private _label: string = '';

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

        const input: HTMLInputElement | null = this.shadowRoot.querySelector('.input-group__input');
        if (input) input.name = value;
    }

    public get value(): string { return this._value }
    public set value(value: string) {
        this._value = value;
        this._internals.setFormValue(value);

        const input: HTMLInputElement | null = this.shadowRoot.querySelector('.input-group__input');
        if (input) input.value = value;
    }

    public get type(): 'hidden' | 'text' | 'number' { return this._type }
    public set type(value: 'hidden' | 'text' | 'number') {
        this._type = value;

        const input: HTMLInputElement | null = this.shadowRoot.querySelector('.input-group__input');
        if (input) input.type = value;
    }

    public get label(): string { return this._label }
    public set label(value: string) {
        this._label = value;

        const label: HTMLLabelElement | null = this.shadowRoot.querySelector('.input-group__label');
        if (label) label.innerHTML = value;
    }

    public connectedCallback(): void {
        this._internals.setFormValue(this.value, this.name);
        this._setup();
    }

    public disconnectedCallback(): void {

    }

    private _setup(): void {
        this._setupInput();
    }

    private _setupInput(): void {
        const input: HTMLInputElement | null = this.shadowRoot.querySelector('.input-group__input');
        if (!input) return;
        input.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this._value = target.value;
            this._internals.setFormValue(this._value, this.name);
        });

    }

    static observedAttributes: string[] = ['name', 'value', 'type', 'label'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'name') this.name = newValue;
        if (name === 'value') this.value = newValue;
        if (name === 'type' && (newValue === 'hidden' || newValue === 'text' || newValue === 'number')) this.type = newValue;
        if (name === 'label') this.label = newValue;
    }
}

customElements.define('label-input', LabelInput);