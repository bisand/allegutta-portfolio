import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

export interface IPosition {
    symbol?: string;
    shares?: number;
    avg_price?: number;
}

export interface IPortfolio {
    purchase_value?: number;
    market_value?: number;
    cash?: number;
    equity?: number;
    positions?: IPosition[];
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    public portfolio: IPortfolio;

    private socket$: WebSocketSubject<object>;

    constructor() {
        this.portfolio = { positions: [] };

        this.socket$ = new WebSocketSubject('ws://localhost:4200/api/ws');

        this.socket$.subscribe(
            message => (this.portfolio = Object.assign({} as IPortfolio, message)),
            err => console.error(err),
            () => console.warn('Completed!'),
        );
        const command = { command: 'start' };
        this.socket$.next(command);
    }

    ngAfterViewInit(): void {}
}
