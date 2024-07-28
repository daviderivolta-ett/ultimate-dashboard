const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <p class="content">TEST</p>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    `
    ;

export default class Test extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _message: string = '';
    private _theme: 'dark' | 'light' = 'light';

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public get message(): string { return this._message }
    public set message(value: string) {
        this._message = value;
        this._updateMessage();
    }

    public get theme(): 'dark' | 'light' { return this._theme }
    public set theme(value: 'dark' | 'light') {
        this._theme = value;
        this._updateTheme();
    }

    public connectedCallback(): void {
        this._render();
    }
    
    public disconnectedCallback(): void {
        
    }
    
    private _render(): void {
        this._updateMessage();        
        this._updateTheme();
    }

    static observedAttributes = ['message', 'theme'];
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (newValue !== oldValue) {
            if (name === 'message') {
                this.message = newValue;
            }

            if (name === 'theme' && (newValue === 'dark' || newValue === 'light')) {                
                this.theme = newValue;
            }
        }
    }

    private _updateMessage(): void {
        const p: HTMLParagraphElement | null = this.shadowRoot.querySelector('.content');
        if (p) p.innerHTML = this.message;
    }

    private _updateTheme(): void {
        const p: HTMLParagraphElement | null = this.shadowRoot.querySelector('.content');
        if (p) {
            switch (this.theme) {
                case 'dark':
                    p.style.color = 'red';
                    break;

                default:
                    p.style.color = 'black';
                    break;
            }
        }
    }
}

customElements.define('app-test', Test);