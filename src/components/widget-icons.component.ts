const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="container">
        <span>PIPPO</span>
    </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .container {
        visibility: hidden;
        background-color: red;
    }

    .container--visible {
        visibility: visible;
    }
    `
    ;

export class WidgetIcons extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _isOpen: boolean = false;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get isOpen(): boolean { return this._isOpen }
    public set isOpen(value: boolean) {
        this._isOpen = value;
        this._toggleVisibility();
    }

    public connectedCallback(): void {

    }

    public disconnectedCallback(): void {

    }

    static observedAttributes: string[] = ['is-open'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'is-open' && (newValue === 'true' || newValue === 'false'))  {
            newValue === 'true' ? this.isOpen = true : this.isOpen = false;
        }
    }

    private _toggleVisibility(): void {
        const container: HTMLDivElement | null = this.shadowRoot.querySelector('.container');
        if (!container) return;
        this.isOpen ? container.classList.add('container--visible') : container.classList.remove('container--visible');
    }
}

customElements.define('widget-icons', WidgetIcons);