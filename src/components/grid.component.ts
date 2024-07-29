import './widget.component';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML =
    `
    <app-widget class="square-small" draggable="true"></app-widget>
    <app-widget class="square-small" draggable="true"></app-widget>
    <app-widget class="square-small" draggable="true"></app-widget>
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
            grid-template-columns: repeat(6, calc((100dvw - 16px * 7) / 6));
            grid-auto-rows: calc((100dvw - 16px * 7) / 6);
            grid-auto-flow: row;
            gap: 16px;
        }

        @media (max-width: 1400px) {
            :host {
                grid-template-columns: repeat(4, calc((100dvw - 16px * 5) / 4));
                grid-auto-rows: calc((100dvw - 16px * 5) / 4);
            }
        }                

        @media (max-width: 768px) {
            :host {
                grid-template-columns: repeat(2, calc((100dvw - 16px * 3) / 2));
                grid-auto-rows: calc((100dvw - 16px * 3) / 2);
            }
        }

        @media (max-width: 576px) {
            :host {
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
        this.setup();
    }

    private setup(): void {
        this._handleDragAndDrop();
    }

    private _handleDragAndDrop(): void {
        let draggingElement: any;
        let afterElement: any;

        const elements: NodeListOf<HTMLElement> = this.shadowRoot.querySelectorAll('*[draggable="true"]');
        elements.forEach((element: HTMLElement) => {
            const dragbar: HTMLDivElement | null = element.shadowRoot
                ? element.shadowRoot.querySelector('.draggable')
                : element.querySelector('.draggable');

            if (dragbar) {
                dragbar.addEventListener('mousedown', () => {
                    this.draggingElement = element;
                });
            }

            element.addEventListener('dragstart', (e: DragEvent) => {
                if (this.draggingElement !== element) {
                    e.preventDefault();
                    return;
                }
                element.classList.add('dragging');
            });

            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
                this.draggingElement = null;
                if (afterElement) {
                    afterElement.element ? this.shadowRoot.insertBefore(draggingElement, afterElement.element) : this.shadowRoot.appendChild(draggingElement);
                }
            });
        });

        this.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            afterElement = this.getDragAfterElement(this.shadowRoot, e.clientX, e.clientY);
            draggingElement = this.shadowRoot.querySelector('.dragging');
            if (!draggingElement) return;
        });
    }

    private getDragAfterElement(container: ShadowRoot, x: number, y: number): any {
        const draggableElements = [...container.querySelectorAll('*[draggable="true"]')];

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