import { Label } from 'ng2-charts';
import { IIndicator } from "./IIndicator";
export interface IChartData {
    timestamp: Label[];
    indicators: IIndicator;
}
