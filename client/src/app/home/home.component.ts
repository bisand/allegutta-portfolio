import { Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { DataService } from '../data.service';
import { IPosition } from './IPosition';
import { IPortfolio } from './IPortfolio';

declare var $: any;

export type SortColumn = keyof IPortfolio | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
    column: SortColumn;
    direction: SortDirection;
}

@Directive({
    selector: 'th[sortable]',
    host: {
        '[class.asc]': 'direction === "asc"',
        '[class.desc]': 'direction === "desc"',
        '(click)': 'rotate()'
    }
})
export class NgbdSortableHeader {

    @Input() sortable: SortColumn = '';
    @Input() direction: SortDirection = '';
    @Output() sort = new EventEmitter<SortEvent>();

    rotate() {
        this.direction = rotate[this.direction];
        this.sort.emit({ column: this.sortable, direction: this.direction });
    }
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    private _sortEvent: SortEvent = { column: 'name', direction: 'asc' };
    public _portfolio: IPortfolio;

    public portfolio: IPortfolio;

    constructor(private wss: WebsocketService, private dataService: DataService) {
        this._portfolio = { positions: [] } as IPortfolio;
        this.portfolio = { positions: [] } as IPortfolio;
        this.wss.init().subscribe(
            message => {
                this._portfolio = Object.assign({ positions: [] } as IPortfolio, message);
                this.portfolio = Object.assign({ positions: [] } as IPortfolio, message);
                this.onSort(this._sortEvent)
            },
            err => console.error(err),
            () => console.warn('Completed!'),
        );
    }

    setData(position: IPosition): void {
        this.dataService.position = position;
    }

    ngOnInit() {
    }

    @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

    onSort({ column, direction }: SortEvent) {

        this._sortEvent.column = column;
        this._sortEvent.direction = direction;
        // resetting other headers
        this.headers?.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });

        // sorting countries
        if (direction === '' || column === '') {
            this.portfolio = this._portfolio;
        } else {
            this.portfolio.positions = this.portfolio.positions.sort((a, b) => {
                const res = compare(a[column], b[column]);
                return direction === 'asc' ? res : -res;
            });
        }
    }
}
