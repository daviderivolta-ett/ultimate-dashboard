// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <button type="button" class="button">
        <span class="button__icon">
            <slot></slot>
        </span>
    </button>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    :host {
        display: inline-block;
    }

    .button {
        cursor: pointer;
        width: 40px;
        height: 40px;
        padding: 8px;
    }

    .button__icon {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    `
    ;

// Component
export class IconBtn extends HTMLElement {
    public shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    // Component callbacks
    public connectedCallback(): void {
        this._setup();
    }

    public disconnectedCallback(): void {
        const button: HTMLButtonElement | null = this.shadowRoot.querySelector('.button');
        if (button) button.removeEventListener('click', this._onClick.bind(this));
    }

    private _setup(): void {
        const button: HTMLButtonElement | null = this.shadowRoot.querySelector('.button');
        if (button) button.addEventListener('click', this._onClick.bind(this));
    }

    private _onClick(): void {
        this.dispatchEvent(new CustomEvent('icon-btn-click'));
    }
}

customElements.define('icon-btn', IconBtn);