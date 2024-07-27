import { WidgetSize } from '../models/widget-size.model';
import RadioButton from './radio-btn.component';
import RadioGroup from './radio-group.component';
import './tooltip.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <app-tooltip>
        <radio-group slot="content" name="size"></radio-group>
    </app-tooltip>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            position: relative;
            border: 1px solid crimson;
            border-radius: 8px;
            background-color: azure;
            width: 100%;
            aspect-ratio: 1 / 1;
        }

        :host(.square-small) {
            grid-row: span 1;
            grid-column: span 1;
            aspect-ratio: 1 / 1;
        }

        :host(.square-large) {
            grid-row: span 2;
            grid-column: span 2;
            aspect-ratio: 1 / 1;
        }

        :host(.row-small) {
            grid-row: span 1;
            grid-column: span 3;
            aspect-ratio: unset;
        }

        :host(.row-large) {
            grid-row: span 2;
            grid-column: span 3;
            aspect-ratio: unset;
        }


        :host(.column-small) {
            grid-row: span 3;
            grid-column: span 1;
            aspect-ratio: unset;
        }

        :host(.column-large) {
            grid-row: span 3;
            grid-column: span 2;
            aspect-ratio: unset;
        }

    `
    ;

export default class WidgetComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {
        this.render();
        this.setup();
    }

    private render(): void {
        this.createResizeController();
    }

    private setup(): void {
        const resizeController: RadioGroup | null = this.shadowRoot.querySelector('radio-group');
        if (resizeController) resizeController.addEventListener('size-change', this.handleWidgetResize.bind(this));
    }

    private createResizeController(): void {
        const radioGroup: RadioGroup | null = this.shadowRoot.querySelector('radio-group');
        if (!radioGroup) return;

        Object.values(WidgetSize).forEach((size: string) => {
            const radioButton: RadioButton = new RadioButton();
            radioButton.setAttribute('slot', 'radio-button');
            radioButton.value = size;
            radioButton.name = size;
            radioButton.label = 'O';
            radioGroup.appendChild(radioButton);
            if (size === 'square-small') radioButton.checked = true;
        });
    }

    private handleWidgetResize(event: Event) {
        const e: CustomEvent = event as CustomEvent;
        this.resizeWidget(e.detail);
    }

    private resizeWidget(size: string): void {
        this.resetSize();
        this.classList.add(size);
    }

    private resetSize(): void {
        this.classList.remove(...Object.values(WidgetSize));
    }
}

customElements.define('app-widget', WidgetComponent);