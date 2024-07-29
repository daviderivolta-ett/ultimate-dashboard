const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
        <div class="tooltip" part="base">
            <slot>Default content</slot>
        </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        .tooltip {
            color: white;
            display: flex;
            align-items: center;
            padding: 8px;
            border-radius: 4px;
            background-color: black;
            position: absolute;
            bottom: 16px;
            left: 50%;       
            transform: translateX(-50%);
            opacity: 0;
            transition: .4s ease-in-out;
            overflow: hidden;
        }
        
        :host(.visible) .tooltip {
            opacity: 1;
            transition: .4s ease-in-out;
        }
    `
    ;

export default class TooltipComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _isVisible: boolean = false;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get isVisible(): boolean { return this._isVisible }
    public set isVisible(value: boolean) {
        this._isVisible = value;
        this.isVisible ? this.classList.toggle('visible') : this.classList.toggle('visible');
    }

    public connectedCallback(): void {
        this._setup();
    }

    public disconnectedCallback(): void {
        const parentElement: HTMLElement | null = this._getParentElement();
        if (parentElement) this._removeEventListeners(parentElement);
    }

    private _setup(): void {
        const parentElement: HTMLElement | null = this._getParentElement();
        if (parentElement) this._addEventListeners(parentElement);
    }

    private _getParentElement(): HTMLElement | null {
        const parent: HTMLElement | null = this.parentElement;
        if (parent) return parent;

        const rootNode: Node = this.getRootNode();

        if (rootNode instanceof ShadowRoot) {
            return rootNode.host instanceof HTMLElement ? rootNode.host : null;
        }

        if (rootNode instanceof Document) {
            return rootNode.querySelector(this.tagName) as HTMLElement | null;
        }

        return null;
    }

    private _addEventListeners(element: HTMLElement): void {
        element.addEventListener('mouseover', this._toggleVisibility);
        element.addEventListener('mouseleave', this._toggleVisibility);
    }

    private _removeEventListeners(element: HTMLElement): void {
        element.removeEventListener('mouseover', this._toggleVisibility);
        element.removeEventListener('mouseleave', this._toggleVisibility);
    }

    private _toggleVisibility = (): void => {
        this.isVisible = !this.isVisible;
    }
}

customElements.define('app-tooltip', TooltipComponent);