import '../components/grid.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div id="dashboard">
        <app-grid>
            <app-widget size="square-small" is-fullwidth="true">
                <app-map slot="content" lat="44.40600206763519" lng="8.93632319402044" zoom="14"></app-map>
            </app-widget>
            <app-widget size="square-small"></app-widget>
            <app-widget size="square-small"></app-widget>
            <app-widget size="square-small"></app-widget>
            <app-widget size="square-small"></app-widget>
            <app-widget size="square-large"></app-widget>
        </app-grid>
    </div>
    `
    ;

// <div class="dropzone square-small" style="background-color: purple;"></div>

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