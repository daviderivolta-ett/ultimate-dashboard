// App config
export class AppConfig {
    id: string = 'default';
    label: string = 'Default';
    icon: string = '';
    widgets: AppConfigWidget[] = [];

    constructor() { }
}

export class AppConfigWidget {
    tag: string = 'ettdash-map';
    icon: string = './icons/map.svg';
    cardAttributes: Record<string, any> = {};
    widgetAttributes: Record<string, any> = {};
    wizard: WizardItem[] = [];

    constructor() { }
}

export type WizardItem = WizardItemWithAttribute | WizardItemWithSlot;

export interface WizardBaseItem {
    input: 'text' | 'number';
    label: string;
    value: any;
}

export interface WizardItemWithAttribute extends WizardBaseItem {
    slot?: never;
    attribute: string;
}

export interface WizardItemWithSlot extends WizardBaseItem {
    slot: 'title' | 'desc' | 'content';
    attribute?: never;
}

// Grid config
export class GridConfig {
    id: string = 'standard';
    label: string = 'Standard';
    icon: string = '';
    grid: GridConfigWidget[] = [];

    constructor() { }
}

export type GridConfigWidget = {
    attributes: any;
    slots: GridConfigWidgetSlot[];
}

export type GridConfigWidgetSlot = {
    name: string;
    tag: string;
    attributes: any;
    content: string;
}