const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="grid">
        <slot></slot>
        <div class="dropzone"></div>
    </div>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
    .grid {
        display: grid;
        grid-template-columns: repeat(6, calc((100dvw - 16px * 7) / 6));
        grid-auto-rows: calc((100dvw - 16px * 7) / 6);
        grid-auto-flow: row;
        gap: 16px;
    }

    ::slotted(.square-small) {
        grid-row: span 1;
        grid-column: span 1;
        aspect-ratio: 1 / 1;
    }

    ::slotted(.square-large) {
        grid-row: span 2;
        grid-column: span 2;
        aspect-ratio: 1 / 1;
    }

    ::slotted(.row-small) {
        grid-row: span 1;
        grid-column: span 3;
        aspect-ratio: unset;
    }

    ::slotted(.row-large) {
        grid-row: span 2;
        grid-column: span 3;
        aspect-ratio: unset;
    }

    ::slotted(.column-small) {
        grid-row: span 3;
        grid-column: span 1;
        aspect-ratio: unset;
    }

    ::slotted(.column-large) {
        grid-row: span 3;
        grid-column: span 2;
        aspect-ratio: unset;
    }

    .dragging {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
    }

    ::slotted(.dropzone) {
        border-radius: var(--border-radius);
        background-color: #F2F2F2;
        box-shadow: inset 0 0 5px #00000033;
    }

    @media (max-width: 1400px) {
        .grid {
            grid-template-columns: repeat(4, calc((100dvw - 16px * 5) / 4));
            grid-auto-rows: calc((100dvw - 16px * 5) / 4);
        }
    }                

    @media (max-width: 768px) {
        .grid {
            grid-template-columns: repeat(2, calc((100dvw - 16px * 3) / 2));
            grid-auto-rows: calc((100dvw - 16px * 3) / 2);
        }
    }

    @media (max-width: 576px) {
        .grid {
            grid-template-columns: calc(100dvw - 16px * 2);
            grid-auto-rows: calc(100dvw - 16px * 2);
        }
    }
    `
    ;

export default class GridComponent extends HTMLElement {
    public shadowRoot: ShadowRoot;
    private _dragoverFixAdded: boolean = false;
    public draggingElement: HTMLElement | null = null;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(style.cloneNode(true));
    }

    public connectedCallback(): void {
        this._setup();
    }

    private _setup(): void {
        this._handleDrag();
    }

    private _handleDrag(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');      
        if (!slot) return;

        slot.addEventListener('slotchange', this._onSlotChange.bind(this), { once: true });
    }

    private _onSlotChange(): void {        
        const elements: NodeListOf<HTMLElement> = this.querySelectorAll('*');
        
        elements.forEach((element: HTMLElement) => {
            const anchor: HTMLElement | null = element.shadowRoot ?
                element.shadowRoot.querySelector('.draggable') :
                element.querySelector('.draggable');
            
            if (anchor) {
                anchor.addEventListener('mouseenter', this._onMouseEnter.bind(this, element));
                anchor.addEventListener('mouseleave', this._onMouseLeave.bind(this, element));

                element.addEventListener('dragstart', this._onDragStart.bind(this));
                element.addEventListener('drag', this._onDrag.bind(this));
                element.addEventListener('dragend', this._onDragEnd.bind(this));
            }
        });
    }

    private _onMouseEnter(element: HTMLElement): void {
        element.setAttribute('draggable', 'true');
    }

    private _onMouseLeave(element: HTMLElement): void {
        element.removeAttribute('draggable');
    }

    private _onDragStart(event: DragEvent): void {
        console.log('Drag started');

        if (!(event.currentTarget instanceof HTMLElement)) return;
        event.currentTarget.style.opacity = '.25';
        this.draggingElement = event.currentTarget.cloneNode(true) as HTMLElement;

        this.draggingElement.className = event.currentTarget.className;
        this.draggingElement.style.cssText = event.currentTarget.style.cssText;

        event.currentTarget.id = 'dragging-element';
    }

    private _onDrag(event: DragEvent): void {
        // console.log('Dragging...');
        if (!this.draggingElement) return;

        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (!slot) return;

        let dropzone: HTMLElement | null = this.querySelector('#dropzone');
        if (!dropzone) {
            dropzone = document.createElement('div');
            dropzone.id = 'dropzone';
            dropzone.classList.add('dropzone');
            dropzone.addEventListener('dragover', this._onDragOver.bind(this));
            dropzone.addEventListener('drop', this._onDrop.bind(this));
        }

        dropzone.className = 'dropzone';
        for (const cssClass of Array.from(this.draggingElement.classList)) dropzone.classList.add(cssClass);

        if (event.clientX || event.clientY) {
            this._handleDropzonePosition(slot, dropzone, event.clientX, event.clientY);
        } else {            
            if (!this._dragoverFixAdded) {
                this._dragoverFixAdded = true;
                window.addEventListener('dragover', (event: DragEvent) => this._handleDropzonePosition(slot, dropzone!, event.clientX, event.clientY));
            }
        }
    }

    private _onDragEnd(event: DragEvent): void {
        console.log('Drag ended');
        if (!(event.currentTarget instanceof HTMLElement)) return;

        event.currentTarget.removeAttribute('id');
        event.currentTarget.removeAttribute('style');
        if (this.draggingElement) this.draggingElement = null;

        const dropzone: HTMLElement | null = this.querySelector('#dropzone');
        if (dropzone) {
            dropzone.removeEventListener('dragover', this._onDragOver.bind(this));
            dropzone.remove();
        }
    }

    private _onDragOver(event: DragEvent): void {
        console.log('Drag over');
        event.preventDefault();
        event.stopPropagation();
    }

    private _onDrop(): void {
        console.log('Drop');
        const dropzone: HTMLDivElement | null = this.querySelector('.dropzone');
        const originalElement = this.querySelector(`#dragging-element`) as HTMLElement;

        if (dropzone && originalElement && this.draggingElement) {
            this.replaceChild(originalElement, dropzone);
            this.draggingElement = null;
        }
    }

    private _getUnderneathElement(container: HTMLSlotElement, x: number, y: number): HTMLElement | null {
        const slotElements: HTMLElement[] = container.assignedElements() as HTMLElement[];

        for (const el of slotElements) {
            const box: DOMRect = el.getBoundingClientRect();
            if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return el;
        }

        return null;
    }

    private _handleDropzonePosition(slot: HTMLSlotElement, dropzone: HTMLElement, x: number, y: number): void {
        const underneathElement: HTMLElement | null = this._getUnderneathElement(slot, x, y);
        if (underneathElement && underneathElement !== dropzone) {
            this.insertBefore(dropzone, underneathElement);
        } else if (!underneathElement) {
            this.appendChild(dropzone);
        }
    }
}

customElements.define('draggable-grid', GridComponent);