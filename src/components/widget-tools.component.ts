import { WidgetSize } from '../models/widget-size.model';
import ShapeBtnComponent from './shape-btn.component';

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            display: flex;
            justify-content: left;
            align-items: center;
        }
    `
    ;

export class WidgetToolsComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _sizes: string[] = [];
    private _activeSize: string = 'square-small';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(style.cloneNode(true));

        this.sizes = Object.values(WidgetSize);
    }

    public get sizes(): string[] { return this._sizes }
    public set sizes(value: string[]) { this._sizes = value }

    public get activeSize(): string { return this._activeSize }
    public set activeSize(value: string) {
        this._activeSize = value;
        this.resetSizes(value);
        // this.setActiveBtn(value);
    }

    public connectedCallback(): void {
        this.render();
        this.setup();
    }

    private render(): void {
        this.renderSizeButtons();
    }

    private setup(): void {
        this.setupSizeButtons();
    }

    private renderSizeButtons(): void {
        this.sizes.forEach((size: string) => {
            const btn: ShapeBtnComponent = new ShapeBtnComponent();
            btn.size = size;
            btn.setAttribute('size', size);
            this.shadowRoot.appendChild(btn);
        });

        this.activeSize = 'square-small';
    }

    private setupSizeButtons(): void {
        const buttons: ShapeBtnComponent[] = Array.from(this.shadowRoot.querySelectorAll('app-shape-btn'));
        buttons.forEach((button: ShapeBtnComponent) => {
            button.addEventListener('widget-resized', (e: Event) => {
                const event: CustomEvent = e as CustomEvent;
                this.activeSize = event.detail.size;
                this.dispatchEvent(new CustomEvent('widget-resized', { detail: { size: event.detail.size } }));
            });
        });
    }

    private resetSizes(value: string) {
        const buttons: ShapeBtnComponent[] = Array.from(this.shadowRoot.querySelectorAll('app-shape-btn'));
        for (const button of buttons) {
            if (button.size !== value) button.isActive = false;
        }
    }

    // private setActiveBtn(size: string) {
    //     const buttons: ShapeBtnComponent[] = Array.from(this.shadowRoot.querySelectorAll('app-shape-btn'));
    //     const btn: ShapeBtnComponent | undefined = buttons.find((button) => button.size === size);
    //     if (btn) btn.isActive = true;
    // }
}

customElements.define('app-widget-tools', WidgetToolsComponent);