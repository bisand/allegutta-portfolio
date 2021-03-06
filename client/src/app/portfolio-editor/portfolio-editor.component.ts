import { Component, OnInit } from '@angular/core';
import { IPortfolio } from "../home/IPortfolio";
import { IPosition } from "../home/IPosition";
import { ApiService } from '../api.service';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-portfolio-editor',
    templateUrl: './portfolio-editor.component.html',
    styleUrls: ['./portfolio-editor.component.css'],
})
export class PortfolioEditorComponent implements OnInit {
    portfolio: IPortfolio;
    statusText: string;
    newPosition: IPosition;
    portfolioLoaded: boolean;
    positionToDelete: IPosition;

    faTrash = faTrash;
    faPlus = faPlus;

    constructor(private api: ApiService) {
        this.portfolio = { positions: [] } as IPortfolio;
        this.newPosition = {} as IPosition;
        this.portfolioLoaded = false;
        this.positionToDelete = {} as IPosition;
    }

    ngOnInit() {
    }

    loadPortfolio() {
        this.api.loadPortfolio().subscribe(res => {
            this.portfolio = res;
            this.statusText = 'Porteføljen er lastet.';
            this.portfolioLoaded = true;
        });
    }

    savePortfolio() {
        this.api.savePortfolio(this.portfolio).subscribe(res => {
            this.statusText = 'Porteføljen er lagret.';
        });
    }

    addPosition() {
        this.portfolio.positions.push(this.newPosition);
        this.newPosition = {} as IPosition;
    }

    setPositionToDelete(position: IPosition) {
        this.positionToDelete = position;
    }

    deletePosition(symbol: string) {
        this.portfolio.positions = this.portfolio.positions.filter(position => {
            return position.symbol !== symbol;
        });
        this.positionToDelete = {} as IPosition;
    }
}
