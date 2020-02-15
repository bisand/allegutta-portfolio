import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { ApiService } from '../api.service';
import { filter, map } from 'rxjs/operators';
import { IPosition } from '../home/IPosition';
import { DataService } from '../data.service';
import { WebsocketService } from '../websocket.service';
import { IChartData } from './IChartData';
import { IIndicator } from './IIndicator';
import { IQuote } from './IQuote';
import { IPortfolio } from '../home/IPortfolio';

@Component({
    selector: 'app-linechart',
    templateUrl: './linechart.component.html',
    styleUrls: ['./linechart.component.css'],
})
export class LinechartComponent implements OnInit, OnDestroy {
    private sub: any;
    private data: IChartData = { indicators: { quote: [{} as IQuote] as IQuote[] } as IIndicator } as IChartData;

    public symbol: string;
    public lineChartData: ChartDataSets[] = [{ data: [], label: '' }];
    public lineChartLabels: Label[] = [];

    public lineChartOptions: ChartOptions = {
        responsive: true,
        spanGaps: true,
        elements: {
            point: { pointStyle: 'circle', radius: 1 },
        },
        scales: {
            xAxes: [
                {
                    type: 'time',
                    distribution: 'linear',
                    offset: true,
                    ticks: {
                        major: {
                            enabled: true,
                            fontStyle: 'bold',
                        },
                        source: 'auto',
                        maxRotation: 0,
                        autoSkip: true,
                    },
                    time: {
                        unit: 'minute',
                        stepSize: 30,
                        displayFormats: {
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                        },
                    },
                },
            ],
            yAxes: [
                {
                    type: 'linear',
                },
            ],
        },
    };

    public lineChartColors: Color[] = [
        {
            borderColor: 'black',
            backgroundColor: 'rgba(200,200,200,0.28)',
        },
    ];

    public lineChartLegend = true;
    public lineChartPlugins = [];
    public lineChartType = 'line';
    public position: IPosition = {} as IPosition;

    constructor(private activatedRoute: ActivatedRoute, private dateService: DataService, private api: ApiService, private wss: WebsocketService) {
        this.position = dateService.position;
    }

    ngOnInit(): void {
        this.sub = this.activatedRoute.params.subscribe(params => {
            this.symbol = params.id;
            this.wss.init().subscribe(
                message => {
                    const portfolio = Object.assign({} as IPortfolio, message);
                    if (portfolio && portfolio.positions) {
                        this.position = portfolio.positions.filter(pos => {
                            return pos.symbol === this.symbol;
                        })[0];
                    }
                },
                err => console.error(err),
                () => console.warn('Completed!'),
            );
            this.api.loadChart(this.symbol).subscribe(
                res => {
                    this.data = res as IChartData;
                    if (this.data && this.data.timestamp) {
                        this.data.timestamp.forEach(x => {
                            const currentDate: Date = new Date(Number(x) * 1000);
                            this.lineChartLabels.push(currentDate.toString());
                        });
                    }
                    this.lineChartData = [{ data: this.data.indicators.quote[0].close, lineTension: 0, borderWidth: 1, steppedLine: 'before', label: this.symbol }];
                },
                err => console.error(err),
                () => console.warn('Completed!'),
            );
        });
    }
    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}
