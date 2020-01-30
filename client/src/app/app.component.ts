import { Component, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

export interface IPosition {
    symbol?: string;
    shares?: number;
    avg_price?: number;
}

export interface IPortfolio {
    cost_value?: number;
    market_value?: number;
    market_value_prev?: number;
    market_value_min?: number;
    market_value_max?: number;
    change_total?: number;
    change_total_percent?: number;
    change_today_total?: number;
    change_today_percent?: number;
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

        const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let echoSocketUrl = socketProtocol + '//' + window.location.hostname + ':' + window.location.port;
        // if (window.location.pathname !== '/') {
        //     echoSocketUrl += '/' + window.location.pathname;
        // }
        echoSocketUrl += '/portfolio/ws/';
        this.socket$ = new WebSocketSubject(echoSocketUrl);

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
