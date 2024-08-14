import RadioButton from './radio-btn.component';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="radio-group">
        <slot></slot>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .radio-group {
        display:flex;
        justify-content: center;
        align-items: center;
        gap: 2px;
    }

    .radio-group--horizontal {
        flex-direction: row;
        justify-content: center;
    }

    .radio-group--vertical {
        flex-direction: column;
        align-items: start;
    }
    `
    ;

// Component
export default class RadioGroupComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    private _name: string = 'radio';
    private _layout: 'horizontal' | 'vertical' = 'horizontal';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get name(): string { return this._name }
    public set name(value: string) { this._name = value }

    public get layout(): 'horizontal' | 'vertical' { return this._layout }
    public set layout(value: 'horizontal' | 'vertical') {
        this._layout = value;
        value === 'horizontal' ? this._setHorizontalLayout() : this._setVerticalLayout();
    }

    // Component callbacks
    public connectedCallback(): void {
        this.setup();
    }

    public disconnectedCallback(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (slot) slot.removeEventListener('slotchange', this._handleSlotChange.bind(this));
    }

    static observedAttributes: string[] = ['name', 'layout-orientation'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'name') this.name = newValue;
        if (name === 'layout-orientation' && (newValue === 'horizontal' || newValue === 'vertical')) this.layout = newValue;
    }

    private setup(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (slot) slot.addEventListener('slotchange', this._handleSlotChange.bind(this));
    }

    // Methods
    private _handleSlotChange(): void {
        const radioButtons: RadioButton[] = Array.from(this.querySelectorAll('radio-button'));

        radioButtons.forEach((radioButton: RadioButton) => {
            radioButton.addEventListener('radio-change', (e) => this.handleRadioChange(e));
        });
    }

    private handleRadioChange(event: Event): void {
        const e: CustomEvent = event as CustomEvent;
        const radioButtons: RadioButton[] = Array.from(this.querySelectorAll('radio-button'));

        radioButtons.forEach((radioButton: RadioButton) => {
            if (radioButton.value !== e.detail) radioButton.checked = false;
        });

        this.dispatchEvent(new CustomEvent(`${this.name}-change`, { bubbles: true, composed: true, detail: e.detail }));
    }

    private _setHorizontalLayout(): void {
        const group: HTMLDivElement | null = this.shadowRoot.querySelector('.radio-group');
        if (group) {
            group.classList.remove('radio-group--vertical');
            group.classList.add('radio-group--horizontal');
        }
    }

    private _setVerticalLayout(): void {
        const group: HTMLDivElement | null = this.shadowRoot.querySelector('.radio-group');
        if (group) {
            group.classList.remove('radio-group--horizontal');
            group.classList.add('radio-group--vertical');
        }
    }
}

customElements.define('radio-group', RadioGroupComponent);