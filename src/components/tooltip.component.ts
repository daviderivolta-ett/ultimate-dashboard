const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <slot name="content">Default content</slot>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            color: white;
            display: flex;
            align-items: center;
            position: absolute;
            bottom: 16px;
            left: 50%;
            padding: 8px;
            border-radius: 4px;
            transform: translateX(-50%);
            background-color: black;
            opacity: 0;
            animation: fadeOut .4s ease-in-out forwards;
            overflow: hidden;
        }
        
        :host(.visible) {
            animation: fadeIn .4s ease-in-out forwards;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
            }
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
        this.setup();
    }

    public disconnectedCallback(): void {
        const parentElement: HTMLElement | null = this.getParentElement();
        if (parentElement) this.removeEventListeners(parentElement);
    }

    public setup(): void {
        const parentElement: HTMLElement | null = this.getParentElement();
        if (parentElement) this.addEventListeners(parentElement);
    }

    private getParentElement(): HTMLElement | null {
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

    private addEventListeners(element: HTMLElement): void {
        element.addEventListener('mouseover', () => this.toggleVisibility());
        element.addEventListener('mouseleave', () => this.toggleVisibility());
    }

    private removeEventListeners(element: HTMLElement): void {
        element.removeEventListener('mouseover', () => this.toggleVisibility());
        element.removeEventListener('mouseleave', () => this.toggleVisibility());
    }

    public toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}

customElements.define('app-tooltip', TooltipComponent);