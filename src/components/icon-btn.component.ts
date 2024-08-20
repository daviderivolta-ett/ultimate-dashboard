// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <button type="button" class="button">
        <span class="button__icon">
            <slot name="icon"></slot>
        </span>
    </button>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .button {
        cursor: pointer;
        width: 32px;
        height: 32px;
        padding: 0px;
        color: var(--button-default-fg-color-rest);
        background-color: var(--button-default-bg-color-rest);
        border: 1px solid var(--button-default-border-color-rest);
        border-radius: var(--border-radius-small);

        &:hover {
            color: var(--button-default-fg-color-hover);
            background-color: var(--button-default-bg-color-hover);
        }
    }

    .button__icon {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    slot[name="icon"] {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    `
    ;

// Component
export class IconBtnComponent extends HTMLElement {
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
        if (button) button.removeEventListener('click', this._onClick);
    }

    private _setup(): void {
        const button: HTMLButtonElement | null = this.shadowRoot.querySelector('.button');
        if (button) button.addEventListener('click', this._onClick);
    }

    private _onClick = (): void => {
        this.dispatchEvent(new CustomEvent('icon-btn-click', { bubbles: true, composed: true }));
    }
}

customElements.define('icon-button', IconBtnComponent);