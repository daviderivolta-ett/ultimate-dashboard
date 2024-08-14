// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="topbar">
        <div class="topbar__menu">
            <slot name="topbar-menu"></slot>
        </div>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .topbar {
        height: 56px;
        display: flex;
        justify-content: right;
        align-items: center;
        background-color: var(--bg-color-default);
        border-bottom: 1px solid var(--border-color-default);
        padding: 0 4%;
        box-sizing: border-box;
    }

    .topbar__menu {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    `
    ;

// Component
export default class TopbarComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {

    }

    public disconnectedCallback(): void {

    }

    static observedAttributes: string[] = [];
    public attributeChangedCallback(): void {

    }
}

customElements.define('navigation-topbar', TopbarComponent);