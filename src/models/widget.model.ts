export class Widget {
    size: WidgetSize = WidgetSize.SquareSm;
    isFullwidth: boolean = false;
    slots: WidgetSlot[] = [];

    constructor() { }
}

export class WidgetSlot {
    name: string = 'content';
    tag: string = 'span';
    attributes: any = {};
    content: string = '';

    constructor() { }
}

export enum WidgetSize {
    SquareSm = 'square-small',
    SquareLg = 'square-large',
    RowSm = 'row-small',
    RowLg = 'row-large',
    ColumnSm = 'column-small',
    ColumLg = 'column-large'
}