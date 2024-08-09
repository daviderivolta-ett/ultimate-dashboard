import { WizardItem } from '../models/config.model';

// Template
const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <form method="dialog">
        <div class="form__fields"></div>
        <button type="submit">Crea componente</button>
    </form>
    `
    ;

// Style
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    `
    ;

// Component
export default class WizardFormComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _wizardItems: WizardItem[] = [];

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get wizardItems(): WizardItem[] { return this._wizardItems }
    public set wizardItems(value: WizardItem[]) {
        this._wizardItems = value;
        this._render();
    }

    // Component callbacks
    public connectedCallback(): void {
        this._render();
        this._setup();
    }

    private _render(): void {
        const inputs: HTMLElement[] = this._createWizardInputs(this.wizardItems);

        const div: HTMLDivElement | null = this.shadowRoot.querySelector('.form__fields');
        if (!div) return;

        div.innerHTML = '';
        inputs.forEach((input: HTMLElement) => div.appendChild(input));
    }

    private _setup(): void {
        this._setupForm();
    }

    // Methods
    private _createWizardInputs(wizardData: WizardItem[]): HTMLElement[] {
        const items: HTMLElement[] = [];

        wizardData.forEach((item: WizardItem) => {
            const div = document.createElement('div');

            const label = document.createElement('label');
            const uuid = this._generateUuid();
            label.setAttribute('for', `${uuid}`);
            label.innerHTML = item.label;

            const input = document.createElement('input');
            input.id = `${uuid}`;
            input.type = item.input;
            if (item.attribute) input.name = item.attribute;
            if (item.slot) input.name = item.slot;

            switch (input.type) {
                case 'checkbox':
                    input.checked = item.value;
                    div.appendChild(input);
                    div.appendChild(label);
                    break;
                default:
                    input.value = item.value;
                    div.appendChild(label);
                    div.appendChild(input);
                    break;
            }

            items.push(div);
        });

        return items;
    }

    private _generateUuid(): string {
        const letters: string = "abcdefghijklmnopqrstuvwxyz";
        let uuid: string = '';

        while (uuid.length < 10) {
            const randomIndex: number = Math.floor(Math.random() * letters.length);
            let randomLetter: string = letters[randomIndex];
            const isUpperCase = Math.random() < 0.5;
            randomLetter = isUpperCase ? randomLetter.toUpperCase() : randomLetter.toLowerCase();

            if (isUpperCase) {
                const randomDigit: number = Math.floor(Math.random() * 10);
                uuid += randomLetter + randomDigit;
            } else {
                uuid += randomLetter;
            }
        }
        return uuid.length > 10 ? uuid.slice(0, 10) : uuid;
    }

    private _setupForm(): void {
        const form: HTMLFormElement | null = this.shadowRoot.querySelector('form');
        if (!form) return;
        form.addEventListener('submit', this._handleSubmit.bind(this));
    }

    private _handleSubmit(event: SubmitEvent): void {
        event.preventDefault();
        const dialog: HTMLDialogElement | null = this.closest('dialog');
        if (dialog) dialog.close();

        const form = this.shadowRoot.querySelector('form');
        if (!form) return;

        const formData: FormData = new FormData(form);
        this.dispatchEvent(new CustomEvent('form-submit', { composed: true, detail: formData }));
    }

}

customElements.define('wizard-form', WizardFormComponent);