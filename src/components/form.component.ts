import { AppConfigWidget, GridConfigWidget, GridConfigWidgetSlot, WizardItem } from '../models/config.model';
import LabelInput from './label-input.component';
import { LabelSelect } from './label-select.component';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="form">
        <h2 class="form__title">Creazione widget</h2>
        <form>
            <div class="form__fields"></div>
            <button type="submit" class="form__button">Crea componente</button>
        </form>
    </div>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .form__title {
        text-align: center;
        font-weight: 700;
        font-size: 1.143rem;
        margin: 0 0 24px 0;
    }

    .form__fields {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin: 0 0 16px 0;
    }

    .form__button {
        cursor: pointer;
        font-family: "Inter", sans-serif;
        font-size: 1rem;
        padding: 8px;
        color: var(--button-primary-fg-color-rest);
        background-color: var(--button-primary-bg-color-rest);
        width: 100%;
        border: none;
        border-radius: 4px;
        height: 40px;

        &:hover {
            background-color: var(--button-primary-bg-color-hover);
        }
    }
    `
    ;

// Component
export default class WizardFormComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _widget: AppConfigWidget = new AppConfigWidget();

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get widget(): AppConfigWidget { return this._widget }
    public set widget(value: AppConfigWidget) {
        this._widget = value;
        // this._render();
    }

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    private _render(): void {
        const inputs: HTMLElement[] = this._createWizardInputs(this.widget);

        const div: HTMLDivElement | null = this.shadowRoot.querySelector('.form__fields');
        if (!div) return;

        div.innerHTML = '';
        inputs.forEach((input: HTMLElement) => div.appendChild(input));
    }

    private _setup(): void {
        this._setupForm();
    }

    // Methods
    private _createWizardInputs(data: AppConfigWidget): HTMLElement[] {
        console.log(data);
        const items: HTMLElement[] = [];

        for (const key in data.cardAttributes) {
            const input: LabelInput = new LabelInput();
            input.setAttribute('data-type', 'card-attribute');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', data.cardAttributes[key]);
            items.push(input);
        }

        for (const key in data.widgetAttributes) {
            const input: LabelInput = new LabelInput();
            input.setAttribute('data-type', 'widget-attribute');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', data.widgetAttributes[key]);
            items.push(input);
        }

        data.wizard.forEach((item: WizardItem) => {
            if (item.input === 'number' || item.input === 'text') {
                const input: LabelInput = new LabelInput();
                input.setAttribute('label', item.label);
                input.setAttribute('type', item.input);

                if (typeof item.value === 'string' || typeof item.value === 'number') input.setAttribute('value', item.value.toString());

                if (item.attribute) {
                    input.setAttribute('name', item.attribute);
                    input.setAttribute('data-type', 'widget-attribute');
                }
                if (item.slot) {
                    input.setAttribute('name', item.slot);
                    input.setAttribute('data-type', 'slot');
                }

                items.push(input);
            }

            if (item.input === 'select') {
                const select: LabelSelect = new LabelSelect();
                const label: HTMLSpanElement = document.createElement('span');

                if (item.attribute) {
                    select.setAttribute('name', item.attribute);
                    select.setAttribute('data-type', 'widget-attribute');
                }

                label.setAttribute('slot', 'label');
                label.innerHTML = item.label;
                select.appendChild(label);

                if (Array.isArray(item.value)) {
                    item.value.forEach((obj: any) => {
                        const option: HTMLSpanElement = document.createElement('span');
                        option.setAttribute('slot', 'select');

                        if (typeof obj.attribute === 'string') option.setAttribute('value', obj.attribute);
                        if (typeof obj.attribute === 'object') option.setAttribute('value', JSON.stringify(obj.attribute));

                        option.innerHTML = obj.label;

                        select.appendChild(option);
                    });
                }

                items.push(select);
            }
        });

        return items;
    }

    private _setupForm(): void {
        const form: HTMLFormElement | null = this.shadowRoot.querySelector('form');
        if (!form) return;
        form.addEventListener('submit', this._handleSubmit.bind(this));
    }

    private _handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        const form = this.shadowRoot.querySelector('form');
        if (!form) return;

        const formData: FormData = new FormData(form);

        const widget: GridConfigWidget = {
            attributes: {},
            slots: []
        }

        const slot: GridConfigWidgetSlot = {
            name: 'content',
            tag: this.widget.tag,
            attributes: {},
            slots: [],
            content: ''
        }

        const selectAttributes: Record<string, any> = this._processFormElements('label-select', formData, slot);
        const inputAttributes: Record<string, any> = this._processFormElements('label-input', formData, slot);

        widget.attributes = { ...selectAttributes, ...inputAttributes };

        widget.slots.push(slot);
        this.dispatchEvent(new CustomEvent('form-submit', { composed: true, detail: widget }));
    }

    private _processFormElements(selector: string, formData: FormData, slot: GridConfigWidgetSlot): Record<string, any> {
        const elements: NodeListOf<HTMLElement> = this.shadowRoot?.querySelectorAll(selector) || [];
        const attributes: Record<string, any> = {};

        elements.forEach((element: HTMLElement) => {
            const type: string | undefined = (element as any).dataset.type;
            const name: string = (element as any).name;
            const value: FormDataEntryValue | null = formData.get(name);
            if (!value) return;

            if (name === 'chart-dataset') {
                try {
                    const chartDataset: any = JSON.parse(value.toString().replace(/'/g, '"'));

                    if (type === 'widget-attribute') {
                        Object.assign(slot.attributes, chartDataset.attributes);

                        for (const key in chartDataset.slots) {
                            const subSlotData: any = chartDataset.slots[key];
                            const subSlot: GridConfigWidgetSlot = {
                                name: subSlotData.name || '',
                                tag: subSlotData.span || 'span',
                                attributes: {},
                                slots: [],
                                content: subSlotData.content || ''
                            };
                            slot.slots.push(subSlot);
                        }
                    }
                } catch (error) {
                    console.error('Failed to parse chart-dataset:', error);
                }
            } else {
                switch (type) {
                    case 'card-attribute':
                        attributes[name] = value;
                        break;

                    case 'widget-attribute':
                        slot.attributes[name] = value;
                        break;

                    case 'slot':
                        const subSlot: GridConfigWidgetSlot = {
                            name,
                            tag: 'span',
                            attributes: {},
                            slots: [],
                            content: value.toString()
                        };
                        slot.slots.push(subSlot);
                        break;

                    default:
                        console.warn(`Unknown type: ${type}`);
                        break;
                }
            }
        });

        return attributes;
    }
}

customElements.define('wizard-form', WizardFormComponent);