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
        background-color: #8EB9C0;
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

        const dropzone: HTMLDivElement | null = this.querySelector('.dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', (event: DragEvent) => this._onDragOver(event));
            dropzone.addEventListener('drop', (event: DragEvent) => this._onDrop(event));
        }
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

                element.addEventListener('dragstart', (event: DragEvent) => this._onDragStart(event, element));
                element.addEventListener('drag', (event: DragEvent) => this._onDrag(event));
                element.addEventListener('dragend', this._onDragEnd.bind(this, element));
            }
        });
    }

    private _onMouseEnter(element: HTMLElement): void {
        element.setAttribute('draggable', 'true');
    }

    private _onMouseLeave(element: HTMLElement): void {
        element.removeAttribute('draggable');
    }

    private _onDragStart(event: DragEvent, element: HTMLElement): void {
        console.log('Drag started');         
        this.draggingElement = element.cloneNode(true) as HTMLElement;        
        this.draggingElement.className = element.className;
        this.draggingElement.style.cssText = element.style.cssText;

        element.style.opacity = '0';
        element.id = 'dragging-element';

        this.draggingElement.style.position = 'fixed';
        this.draggingElement.style.pointerEvents = 'none';
        this.draggingElement.style.zIndex = '9999';
        this.draggingElement.style.borderRadius = '24px';
        this.draggingElement.style.boxShadow = '0 0 50px #00000059';
        this.draggingElement.style.scale = '1.1';
        this.draggingElement.style.width = element.clientWidth + 'px';
        this.draggingElement.style.height = element.clientHeight + 'px';
        this.draggingElement.style.left = `${event.clientX}px`;
        this.draggingElement.style.top = `${event.clientY}px`;

        document.body.appendChild(this.draggingElement);
    }

    private _onDrag(event: DragEvent): void {
        if (!this.draggingElement) return;
        this.draggingElement.style.left = `${event.clientX}px`;
        this.draggingElement.style.top = `${event.clientY}px`;

        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (!slot) return;

        let dropzone: HTMLElement | null = this.querySelector('#dropzone');

        if (!dropzone) {
            
            dropzone = document.createElement('div');
            dropzone.id = 'dropzone';

            for (const cssClass of Array.from(this.draggingElement.classList)) {
                dropzone.classList.add(cssClass);
            }
            
            dropzone.classList.add('dropzone');
        }

        const underneathElement: HTMLElement | null = this._getUnderneathElement(slot, event.clientX, event.clientY);

        if (underneathElement && underneathElement !== dropzone) {
            this.insertBefore(dropzone, underneathElement);
        // } else if (!underneathElement && dropzone.parentNode !== this) {
        //     this.appendChild(dropzone);
        } else if (!underneathElement) {
            this.appendChild(dropzone);
        }
    }

    private _onDragEnd(element: HTMLElement): void {
        console.log('Drag ended');
        element.removeAttribute('style');
        element.removeAttribute('id')

        if (this.draggingElement) {
            document.body.removeChild(this.draggingElement);
            this.draggingElement = null;
        }

        const dropzone: HTMLElement | null = this.querySelector('#dropzone');
        if (dropzone) dropzone.remove();
    }

    private _onDragOver(event: DragEvent): void {
        event.preventDefault();
        console.log('Drag over');
    }

    private _onDrop(event: DragEvent): void {
        console.log('Drop:', event);
        const dropzone: HTMLDivElement | null = this.querySelector('.dropzone');

        const originalElement = this.querySelector(`#dragging-element`) as HTMLElement;
        console.log(originalElement);
        if (dropzone && originalElement && this.draggingElement) {
            originalElement.style.removeProperty('opacity');
            dropzone.appendChild(originalElement);
            originalElement.removeAttribute('id');

            document.body.removeChild(this.draggingElement);
            this.draggingElement = null;
        }
    }

    private _getUnderneathElement(container: HTMLSlotElement, x: number, y: number): HTMLElement | null {
        const slotElements: HTMLElement[] = container.assignedElements() as HTMLElement[];

        for (const el of slotElements) {
            const box: DOMRect = el.getBoundingClientRect();

            if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
                return el;
            }
        }

        return null;
    }

    private getDragAfterElement(container: HTMLSlotElement, x: number, y: number): { distance: number, element: HTMLElement | null } {
        const slotElements: HTMLElement[] = container.assignedElements() as HTMLElement[];
        const draggableElements: HTMLElement[] = slotElements.filter(el => el.draggable);

        return draggableElements.reduce<{ distance: number; element: HTMLElement | null }>((closest, child) => {
            const box = child.getBoundingClientRect();
            const offsetX = x - (box.left + box.width / 2);
            const offsetY = y - (box.top + box.height / 2);
            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

            if (distance < closest.distance) {
                return { distance: distance, element: child as HTMLElement };
            } else {
                return closest;
            }
        }, { distance: Number.POSITIVE_INFINITY, element: null });
    }

}

customElements.define('app-grid', GridComponent);