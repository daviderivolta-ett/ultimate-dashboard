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

    public value: string = '';
    public name: string = '';
    public label: string = '';

    public input: HTMLInputElement = document.createElement('input');

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

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