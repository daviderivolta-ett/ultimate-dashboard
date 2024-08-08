import { AppConfig } from '../models/config.model';

export class ConfigService {
    private CONFIG_URL: string = './config/config.json';
    private static _instance: ConfigService;
    private _config: AppConfig | null = null;

    constructor() {
        if (ConfigService._instance) return ConfigService._instance;
        ConfigService._instance = this;
    }

    static get instance(): ConfigService {
        if (!ConfigService._instance) ConfigService._instance = new ConfigService();
        return ConfigService._instance;
    }

    public get config(): AppConfig | null {
        return this._config;
    }

    public set config(value: AppConfig | null) {
        this._config = value;
        if (value) this._setCustomConfig(value);
    }

    public async getConfig(id: string = 'standard'): Promise<AppConfig> {
        if (this.config) return this.config;

        const customConfig: AppConfig | null = this._getCustomConfig();
        if (customConfig) {
            this._config = customConfig;
            return customConfig;
        }

        const data: any = await fetch(this.CONFIG_URL).then((res: Response) => res.json());
        const config: AppConfig = this._parseConfig(data, id);
        this._config = config;

        return config;
    }

    private _getCustomConfig(): AppConfig | null {
        const configJson: string | null = localStorage.getItem('config');
        if (!configJson) return null;
        const config: AppConfig = JSON.parse(configJson);
        return config;
    }

    private _setCustomConfig(config: AppConfig): void {
        localStorage.setItem('config', JSON.stringify(config));
    }

    private _parseConfig(data: any, id: string = 'standard'): AppConfig {
        const config: AppConfig = new AppConfig();

        if (!data.configs && !Array.isArray(data.configs)) return config;

        data.configs = data.configs.filter((config: any) => config.id === id);

        for (const c of data.configs) {
            if (c.id) config.id = c.id;
            if (c.label) config.label = c.label;
            if (c.icon) config.icon = c.icon;
            if (c.widgets) config.widgets = c.widgets;
        }

        return config;
    }
}