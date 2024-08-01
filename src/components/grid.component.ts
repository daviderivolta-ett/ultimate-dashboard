const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <div class="grid">
        <slot></slot>
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
        this._handleDragAndDrop();
    }

    private _handleDragAndDrop(): void {
        const slot: HTMLSlotElement | null = this.shadowRoot.querySelector('slot');
        if (!slot) return;

        slot.addEventListener('slotchange', () => {
            const elements: NodeListOf<HTMLElement> = this.querySelectorAll('*[draggable="true"]');
            elements.forEach((element: HTMLElement) => {
                const draggable: HTMLElement | null = element.shadowRoot ?
                    element.shadowRoot.querySelector('.draggable') :
                    element.querySelector('.draggable');

                if (draggable) draggable.addEventListener('mousedown', () => this.draggingElement = element);

                element.addEventListener('dragstart', (e: DragEvent) => {
                    if (this.draggingElement !== element) {
                        e.preventDefault();
                        return;
                    }
                    element.classList.add('dragging');
                });

                element.addEventListener('dragend', (event: DragEvent) => {
                    const afterElement: { distance: number, element: HTMLElement | null } = this.getDragAfterElement(slot, event.clientX, event.clientY);
                    if (!this.draggingElement) return;

                    afterElement ? this.insertBefore(this.draggingElement, afterElement.element) : this.appendChild(this.draggingElement);

                    element.classList.remove('dragging');
                    this.draggingElement = null;
                });

            });
        });
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