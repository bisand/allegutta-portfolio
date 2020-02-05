import { PortfolioPosition } from './position';

export class Portfolio {
    id: number;
    name: number;
    cash: number;
    equity: number;
    cost_value: number;
    market_value: number;
    market_value_prev: number;
    market_value_max: number;
    market_value_min: number;
    change_today_total: number;
    change_today_percent: number;
    change_total: number;
    change_total_percent: number;
    positions: PortfolioPosition[];
}
