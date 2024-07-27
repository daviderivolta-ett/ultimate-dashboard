const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <button type="button"></button>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        @import '/src/style.css';

        :host(.active) button {
            background-color: white;
        }
    `
    ;

export default class ShapeBtnComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    private _size: string = 'square-small';
    private _isActive: boolean = false;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'closed' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get size(): string { return this._size }
    public set size(value: string) { this._size = value }

    public get isActive(): boolean { return this._isActive }
    public set isActive(value: boolean) {
        this._isActive = value;
        this.isActive ? this.classList.add('active') : this.classList.remove('active');
    }

    public connectedCallback(): void {
        this.getAttributes();
        this.render();
        this.setup();
    }

    private render(): void {
        const btn: HTMLButtonElement | null = this.shadowRoot.querySelector('button');
        if (btn) btn.innerHTML = 'X';
    }

    private getAttributes(): void {
        const size: string | null = this.getAttribute('size');
        if (size) this.size = size;

        const isActive: string | null = this.getAttribute('is-active');
        if (isActive && isActive === 'true') this.isActive = true;
    }

    private setup(): void {
        const btn: HTMLButtonElement | null = this.shadowRoot.querySelector('button');
        if (btn) btn.addEventListener('click', () => {
            this.toggleActive();
            this.dispatchEvent(new CustomEvent('widget-resized', { detail: { size: this.size } }));
        });
    }

    public toggleActive(): void {
        this.isActive = !this.isActive;
    }
}

customElements.define('app-shape-btn', ShapeBtnComponent);