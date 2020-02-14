import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

export interface IQuote {
    volume: number[];
    high: number[];
    open: number[];
    low: number[];
    close: number[];
}
export interface IIndicator {
    quote: IQuote[];
}
export interface IChartData {
    timestamp: Label[];
    indicators: IIndicator;
}

@Component({
    selector: 'app-linechart',
    templateUrl: './linechart.component.html',
    styleUrls: ['./linechart.component.css'],
})
export class LinechartComponent implements OnInit, OnDestroy {
    private sub: any;
    private id: string;
    private data: IChartData = { indicators: { quote: [{} as IQuote] as IQuote[] } as IIndicator } as IChartData;

    public lineChartData: ChartDataSets[] = [{ data: [], label: '' }];

    public lineChartLabels: Label[] = [];

    public lineChartOptions: ChartOptions = {
        responsive: true,
        spanGaps: true,
        elements: {
            point: {
                radius: 0
            }
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

    constructor(private route: ActivatedRoute, private api: ApiService) {}

    ngOnInit(): void {
        this.sub = this.route.params.subscribe(params => {
            this.id = params.id;
            this.api.loadChart(this.id).subscribe(res => {
                this.data = res as IChartData;
                this.data.timestamp.forEach(x => {
                    const currentDate: Date = new Date(Number(x) * 1000);
                    this.lineChartLabels.push(currentDate.toString());
                });
                this.lineChartData = [{ data: this.data.indicators.quote[0].close, lineTension: 0, borderWidth: 1, steppedLine: 'before', label: this.id }];
            });
        });
    }
    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}
