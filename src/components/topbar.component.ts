// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="topbar">
        <expandable-list>
            <span slot="button-label">Grid</span>
            <radio-group slot="panel-content" name="grid-config" layout-orientation="vertical">
                <radio-button value="standard" name="grid-config" label="Standard" icon-url="/icons/square.svg#square"></radio-button>
                <radio-button value="double-map" name="grid-config" label="Double map" icon-url="/icons/map.svg#map"></radio-button>
            </radio-group>
        </expandable-list>
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