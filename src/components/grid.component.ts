import './widget.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = 
    `
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    <app-widget class="square-small"></app-widget>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            grid-template-rows: auto;
            gap: 16px;
        }

        @media (max-width: 1400px) {
            :host {
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: auto;
            }
        }                

        @media (max-width: 768px) {
            :host {
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: auto;
            }
        }

        @media (max-width: 576px) {
            :host {
                grid-template-columns: repeat(1, 1fr);
                grid-template-rows: auto;
            }
        }
    `
    ;

export default class GridComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {
        this.render();
    }

    private render(): void { }
}

customElements.define('app-grid', GridComponent);