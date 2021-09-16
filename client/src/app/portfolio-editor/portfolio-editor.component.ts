import { Component, OnInit } from '@angular/core';
import { IPortfolio } from "../home/IPortfolio";
import { IPosition } from "../home/IPosition";
import { ApiService } from '../api.service';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ModalsPortfolioSave } from '../modals/modals.portfolio.save';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-portfolio-editor',
    templateUrl: './portfolio-editor.component.html',
    styleUrls: ['./portfolio-editor.component.css'],
})
export class PortfolioEditorComponent implements OnInit {
    portfolio: IPortfolio;
    statusText: String;
    newPosition: IPosition;
    portfolioLoaded: boolean;
    positionToDelete: IPosition;

    faTrash = faTrash;
    faPlus = faPlus;
    private _modalRef: NgbModalRef;

    constructor(private api: ApiService, private _modalService: NgbModal) {
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
        const obj = this;
        this._modalRef = this._modalService.open(ModalsPortfolioSave);
        this._modalRef.closed.subscribe(modalResult => {
            if (modalResult === 'OK click') {
                obj.api.savePortfolio(obj.portfolio).subscribe(res => {
                    console.log(res);
                    obj.statusText = 'Porteføljen er lagret.';
                }, err => {
                    console.error(err);
                }, () => { 
                    console.log('Done!');
                });
            }
        });
        this._modalRef.result.then((result) => {
            console.log(result);
        }, (reason) => {
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
