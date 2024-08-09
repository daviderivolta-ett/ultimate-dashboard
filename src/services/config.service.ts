import { GridConfig } from '../models/config.model';

export class ConfigService {
    private static _instance: ConfigService;
    
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

    public get gridConfig(): GridConfig | null { return this._gridConfig }
    public set gridConfig(value: GridConfig | null) {
        this._gridConfig = value;
        if (value) this._setCustomGridConfig(value);
    }

    public async getGridConfig(id: string = 'standard'): Promise<GridConfig> {
        if (this.gridConfig) return this.gridConfig;

        const customGridConfig: GridConfig | null = this._getCustomGridConfig();
        if (customGridConfig) {
            this._gridConfig = customGridConfig;
            return customGridConfig;
        }

        const data: any = await fetch(this.GRID_CONFIG_URL).then((res: Response) => res.json());
        const gridConfig: GridConfig = this._parseConfig(data, id);
        this._gridConfig = gridConfig;

        return gridConfig;
    }

    private _getCustomGridConfig(): GridConfig | null {
        const configJson: string | null = localStorage.getItem('grid');
        if (!configJson) return null;
        const config: GridConfig = JSON.parse(configJson);
        return config;
    }

    private _setCustomGridConfig(config: GridConfig): void {
        localStorage.setItem('grid', JSON.stringify(config));
    }

    private _parseConfig(data: any, id: string = 'standard'): GridConfig {
        const config: GridConfig = new GridConfig();

        if (!data.configs && !Array.isArray(data.configs)) return config;

        data.configs = data.configs.filter((config: any) => config.id === id);

        for (const c of data.configs) {
            if (c.id) config.id = c.id;
            if (c.label) config.label = c.label;
            if (c.icon) config.icon = c.icon;
            if (c.grid) config.grid = c.grid;
        }

        return config;
    }
}