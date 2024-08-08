export type Widget = {
    attributes: any;
    slots: WidgetSlot[];
}

export type WidgetSlot = {
    name: string;
    tag: string;
    attributes: any;
    content: string;
}

export enum WidgetSize {
    SquareSm = 'square-small',
    SquareLg = 'square-large',
    RowSm = 'row-small',
    RowLg = 'row-large',
    ColumnSm = 'column-small',
    ColumLg = 'column-large'
}