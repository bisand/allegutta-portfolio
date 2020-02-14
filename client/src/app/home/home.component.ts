import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { DataService } from '../data.service';
import { IPosition } from './IPosition';
import { IPortfolio } from './IPortfolio';

declare var $: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    public portfolio: IPortfolio;

    constructor(private wss: WebsocketService, private dataService: DataService) {
        this.portfolio = { positions: [] } as IPortfolio;
        this.wss.init().subscribe(
            message => (this.portfolio = Object.assign({} as IPortfolio, message)),
            err => console.error(err),
            () => console.warn('Completed!'),
        );
    }

    setData(position: IPosition): void{
        this.dataService.position = position;
    }

    ngOnInit() {
        $('[data-toggle="tooltip"]').tooltip();
    }
}
