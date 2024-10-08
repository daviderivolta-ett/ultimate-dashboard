import { AppConfig, AppConfigWidget, GridConfig, WizardItemWithAttribute, WizardItemWithSlot } from '../models/config.model';

export class ConfigService {
    private static _instance: ConfigService;

    private APP_CONFIG_URL: string = './config/app-config.json';
    private _appConfig: AppConfig | null = null;

    private GRID_CONFIG_URL: string = './config/grid-config.json';
    private _gridConfig: GridConfig | null = null;

    constructor() {
        if (ConfigService._instance) return ConfigService._instance;
        ConfigService._instance = this;
    }

    static get instance(): ConfigService {
        if (!ConfigService._instance) ConfigService._instance = new ConfigService();
        return ConfigService._instance;
    }

    public get appConfig(): AppConfig | null { return this._appConfig }
    public set appConfig(value: AppConfig | null) { this._appConfig = value }

    public get gridConfig(): GridConfig | null { return this._gridConfig }
    public set gridConfig(value: GridConfig | null) {
        this._gridConfig = value;
        if (value) this._setCustomGridConfig(value);
    }

    // App config
    public async getAppConfig(id: string = 'default'): Promise<AppConfig> {
        if (this.appConfig) return this.appConfig;

        const data: any = await fetch(this.APP_CONFIG_URL).then((res: Response) => res.json());
        const appConfig: AppConfig = this._parseAppConfig(data, id);
        this._appConfig = appConfig;
        console.log(appConfig);        
        return appConfig;
    }

    private _parseAppConfig(data: any, id: string = 'default'): AppConfig {
        const config: AppConfig = new AppConfig();

        if (!data.configs && !Array.isArray(data.configs)) return config;

        const foundConfig: any = data.configs.find((config: any) => config.id === id);
        if (!foundConfig) return config;

        if (foundConfig.id) config.id = foundConfig.id;
        if (foundConfig.label) config.label = foundConfig.label;
        if (foundConfig.icon) config.icon = foundConfig.icon;
        if (foundConfig.widgets && Array.isArray(foundConfig.widgets)) {
            config.widgets = foundConfig.widgets.map((widget: any) => this._parseAppConfigWidget(widget));
        }

        return config;
    }

    private _parseAppConfigWidget(data: any): AppConfigWidget {
        const widget: AppConfigWidget = new AppConfigWidget();

        if (data.tag) widget.tag = data.tag;
        if (data.icon) widget.icon = data.icon;
        if (data.cardAttributes) widget.cardAttributes = { ...data.cardAttributes };
        if (data.widgetAttributes) widget.widgetAttributes = { ...data.widgetAttributes };
        if (data.wizard && Array.isArray(data.wizard)) {
            widget.wizard = data.wizard.map((item: any) => this._parseAppConfigWidgetWizard(item));
        }

        return widget;
    }

    private _parseAppConfigWidgetWizard(data: any): WizardItemWithAttribute | WizardItemWithSlot {
        let item: WizardItemWithAttribute | WizardItemWithSlot;

        if (data.attribute) {
            item = {
                input: data.input ? data.input : 'text',
                label: data.label ? data.label : 'Inserisci testo',
                value: data.value ? data.value : '',
                attribute: data.attribute ? data.attribute : ''
            }
        } else {
            item = {
                input: data.input ? data.input : 'text',
                label: data.label ? data.label : 'Inserisci testo',
                value: data.value ? data.value : '',
                slot: data.slot ? data.slot : 'content'
            }
        }

        return item;
    }

    // Grid config
    public async getAllGridConfigs(): Promise<GridConfig[]> {
        const data: any = await fetch(this.GRID_CONFIG_URL).then((res: Response) => res.json());
        let configs: GridConfig[] = [];
        if (data.configs && Array.isArray(data.configs)) {
            configs = data.configs.map((d: any) => this._parseGridConfig(d));
        }
        return configs;
    }

    public async getGridConfig(id: string = 'standard'): Promise<GridConfig> {
        const data: any = await fetch(this.GRID_CONFIG_URL).then((res: Response) => res.json());
        const configData: any = data.configs.find((config: any) => config.id === id);
        if (!configData) throw new Error(`Grid configuration with id "${id}" not found`);
        const gridConfig: GridConfig = this._parseGridConfig(configData);
        return gridConfig;
    }

    public getCustomGridConfig(): GridConfig | null {
        const configJson: string | null = localStorage.getItem('grid');
        if (!configJson) return null;
        const config: GridConfig = JSON.parse(configJson);
        return config;
    }

    private _setCustomGridConfig(config: GridConfig): void {
        localStorage.setItem('grid', JSON.stringify(config));
    }

    private _parseGridConfig(data: any): GridConfig {
        const config: GridConfig = new GridConfig();
        if (!data) return config;

        if (data.id) config.id = data.id;
        if (data.label) config.label = data.label;
        if (data.icon) config.icon = data.icon;
        if (data.grid) config.grid = data.grid;

        return config;
    }
}