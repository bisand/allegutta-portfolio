import { Component, OnInit, ViewChild } from '@angular/core';
import { IPortfolio } from "../home/IPortfolio";
import { IPosition } from "../home/IPosition";
import { ApiService } from '../api.service';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ModalsPortfolioSave } from '../modals/modals.portfolio.save';
import { NgbActiveModal, NgbAlert, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { ModalsPositionDelete } from '../modals/modals.position.delete';

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
    errorMessage: any;
    successMessage: string;
    private _success: Subject<string>;
    private _error: Subject<string>;

    constructor(private api: ApiService, private _modalService: NgbModal) {
        this.portfolio = { positions: [] } as IPortfolio;
        this.newPosition = {} as IPosition;
        this.portfolioLoaded = false;
        this.positionToDelete = {} as IPosition;
        this._success = new Subject<string>();
        this._error = new Subject<string>();
    }

    @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert: NgbAlert;
    @ViewChild('selfClosingErrorAlert', { static: false }) selfClosingErrorAlert: NgbAlert;

    ngOnInit() {
        this._success.subscribe(message => this.successMessage = message);
        this._success.pipe(debounceTime(5000)).subscribe(() => {
            if (this.selfClosingAlert) {
                this.selfClosingAlert.close();
            }
        });
        this._error.subscribe(message => this.errorMessage = message);
        this._error.pipe(debounceTime(5000)).subscribe(() => {
            if (this.selfClosingErrorAlert) {
                this.selfClosingErrorAlert.close();
            }
        });
    }

    loadPortfolio() {
        this.api.loadPortfolio().subscribe(res => {
            this.portfolio = res;
            this._success.next(`${new Date()} - Porteføljen er lastet.`);
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
                    this._success.next(`${new Date()} - Porteføljen er lagret.`);
                }, err => {
                    this._error.next(`${new Date()} - ${err}.`);
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
        const obj = this;
        this._modalRef = this._modalService.open(ModalsPositionDelete);
        this._modalRef.componentInstance.positionToDelete = position;
        this._modalRef.closed.subscribe(modalResult => {
            if (modalResult === 'OK click') {
                obj.deletePosition(position.symbol)
            }
        });
        this._modalRef.result.then((result) => {
            console.log(result);
        }, (reason) => {
        });
    }

    deletePosition(symbol: string) {
        this.portfolio.positions = this.portfolio.positions.filter(position => {
            return position.symbol !== symbol;
        });
        this.positionToDelete = {} as IPosition;
    }
}
