import '../components/grid.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="dashboard">
        <app-grid>
            <app-widget class="square-small" draggable="true">
                <app-map lat="44.40600206763519" lng="8.93632319402044" zoom="14"></app-map>
            </app-widget>
            <app-widget class="square-small" draggable="true">
                <p>PIPPO</p>
            </app-widget>
            <app-widget class="square-small" draggable="true"></app-widget>
            <app-widget class="square-small" draggable="true"></app-widget>
            <app-widget class="square-small" draggable="true"></app-widget>
            <app-widget class="square-small" draggable="true"></app-widget>
        </app-grid>
    </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        @import "/src/style.css";

        :host {
            display: block;
            padding: 16px;
        }
    `
    ;

export default class DashboardPage extends HTMLElement {
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

customElements.define('page-dashboard', DashboardPage);