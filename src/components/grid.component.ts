import './widget.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <app-widget class="square-small" draggable="true"></app-widget>
    <app-widget class="square-small" draggable="true"></app-widget>
    <app-widget class="square-small" draggable="true"></app-widget>
    `
    ;

const style: HTMLStyleElement = document.createElement('style');
style.innerHTML =
    `
        :host {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            grid-template-rows: 100% repeat(auto-fill, 100%) 100%;
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
        this.setup();
    }

    private setup(): void {
        // this.handleDragAndDrop();
    }

    private handleDragAndDrop() {
        const elements: NodeListOf<HTMLElement> = this.shadowRoot.querySelectorAll('*');
        elements.forEach((element: HTMLElement) => {
            element.addEventListener('dragstart', () => element.classList.add('dragging'));
            element.addEventListener('dragend', () => element.classList.remove('dragging'));
        });

        this.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(this.shadowRoot, e.clientX, e.clientY);
            const draggingElement: Element | null = this.shadowRoot.querySelector('.dragging');

            if (!draggingElement) return;

            afterElement ? this.shadowRoot.insertBefore(draggingElement, afterElement.element) : this.shadowRoot.appendChild(draggingElement);
        });
    }

    private getDragAfterElement(container: ShadowRoot, x: number, y: number): { distance: number; element: HTMLElement | null } {
        const draggableElements = [...container.querySelectorAll('*:not(.dragging)')];

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