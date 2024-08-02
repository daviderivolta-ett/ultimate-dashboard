import { AppConfig } from '../models/config.model';

export class ConfigService {
    private CONFIG_URL: string = './config/config.json';
    private static _instance: ConfigService;
    private _data: any;

    constructor(){
        if (ConfigService._instance) return ConfigService._instance;
        ConfigService._instance = this;
    }

    static get instance(): ConfigService {
        if (!ConfigService._instance) ConfigService._instance = new ConfigService();
        return ConfigService._instance;
    }

    public get config(): any {
        return this._data;
    }

    public set config(value: any) {
        this._data = value;
    }

    public async getConfig(id: string = 'standard'): Promise<any> {
        if (this.config) return this.config;
        const data: any = await fetch(this.CONFIG_URL).then((res: Response) => res.json());
        const config: AppConfig = this._parseConfig(data, id)
        this.config = config;
        return config;
    }

    private _parseConfig(data: any, id: string = 'standard'): AppConfig {
        const config: AppConfig = new AppConfig();

        if (!data.configs && !Array.isArray(data.configs)) return config;

        data.configs = data.configs.filter((config: any) => config.id === id);

        for (const c of data.configs) {
            if (c.id) config.id = c.id;
            if (c.label) config.label = c.label;
            if (c.grid) config.widgets = c.grid;
        }

        return config;
    }
}