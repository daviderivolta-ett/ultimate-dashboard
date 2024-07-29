import RadioButton from "./radio-btn.component";

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
        <slot></slot>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            display:flex;
            justify-content: center;
            align-items: center;
        }
    `
    ;

export default class RadioGroup extends HTMLElement {
    public shadowRoot: ShadowRoot;

    public name: string = 'radio';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {
        this.getCustomAttributes();
        this.setup();
    }

    private getCustomAttributes(): void {
        const name: string | null = this.getAttribute('name');
        if (name) this.name = name;
    }

    private setup(): void {
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

        this.dispatchEvent(new CustomEvent(`${this.name}-change`, { detail: e.detail }));
    }
}

customElements.define('radio-group', RadioGroup);