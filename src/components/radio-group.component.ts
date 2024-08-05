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
    `
    ;

// Component
export default class RadioGroup extends HTMLElement {
    public shadowRoot: ShadowRoot;

    public name: string = 'radio';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    // Component callbacks
    public connectedCallback(): void {        
        this.getCustomAttributes();
        this.setup();
    }

    public disconnectedCallback(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (slot) slot.removeEventListener('slotchange', this._handleSlotChange.bind(this));
    }

    // Methods
    private getCustomAttributes(): void {
        const name: string | null = this.getAttribute('name');
        if (name) this.name = name;
    }

    private setup(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (slot) slot.addEventListener('slotchange', this._handleSlotChange.bind(this));
    }

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
}

customElements.define('radio-group', RadioGroup);