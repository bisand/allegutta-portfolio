import { IPosition } from './IPosition';

export class IPortfolio {
    public id: number = 0;
    public name: string = '';
    public cash: number = 0.0;
    public ath: number = 0.0;
    public equity: number = 0.0;
    public cost_value: number = 0.0;
    public market_value: number = 0.0;
    public market_value_prev: number = 0.0;
    public market_value_max: number = 0.0;
    public market_value_min: number = 0.0;
    public change_today_total: number = 0.0;
    public change_today_percent: number = 0.0;
    public change_total: number = 0.0;
    public change_total_percent: number = 0.0;
    public positions: IPosition[] = [] as IPosition[];
}
