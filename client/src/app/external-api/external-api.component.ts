import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { IPortfolio } from "../home/IPortfolio";

@Component({
    selector: 'app-external-api',
    templateUrl: './external-api.component.html',
    styleUrls: ['./external-api.component.css'],
})
export class ExternalApiComponent implements OnInit {
    responseJson: string;
    portfolio: IPortfolio;

    constructor(private api: ApiService) {
        this.portfolio = { positions: [] } as IPortfolio;
    }

    ngOnInit() {}

    loadPortfolio() {
        this.api.loadPortfolio().subscribe(res => (this.portfolio = res));
    }

    testApi() {
        this.api.info().subscribe(res => (this.responseJson = res));
    }
}
