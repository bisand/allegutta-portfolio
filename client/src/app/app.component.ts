import { Component, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
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

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };
export const compare = (v1, v2) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export interface SortEvent {
    column: string;
    direction: SortDirection;
}

@Directive({
    selector: 'th[sortable]',
    host: {
        '[class.asc]': 'direction === "asc"',
        '[class.desc]': 'direction === "desc"',
        '(click)': 'rotate()',
    },
})
export class NgbdSortableHeader {
    @Input() sortable: string;
    @Input() direction: SortDirection = '';
    @Output() sort = new EventEmitter<SortEvent>();

    rotate() {
        this.direction = rotate[this.direction];
        this.sort.emit({ column: this.sortable, direction: this.direction });
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    public portfolio: IPortfolio;

    private socket$: WebSocketSubject<object>;

    @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

    constructor() {
        this.portfolio = { positions: [] };

        const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let echoSocketUrl = socketProtocol + '//' + window.location.hostname + ':' + window.location.port;
        if (window.location.pathname !== '/') {
            echoSocketUrl += '/' + window.location.pathname;
        }
        echoSocketUrl += '/api/ws/';
        this.socket$ = new WebSocketSubject(echoSocketUrl);

        this.socket$.subscribe(
            message => (this.portfolio = Object.assign({} as IPortfolio, message)),
            err => console.error(err),
            () => console.warn('Completed!'),
        );
        const command = { command: 'start' };
        this.socket$.next(command);
    }

    onSort({ column, direction }: SortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });

        // sorting countries
        if (direction === '') {
        } else {
            this.portfolio.positions = [...this.portfolio.positions].sort((a, b) => {
                const res = compare(a[column], b[column]);
                return direction === 'asc' ? res : -res;
            });
        }
    }

    ngAfterViewInit(): void {}
}
