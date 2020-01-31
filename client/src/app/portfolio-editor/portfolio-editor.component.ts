import { Component, OnInit } from '@angular/core';
import { IPortfolio, IPosition } from '../home/home.component';
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
        this.portfolio = { positions: [] };
        this.newPosition = {};
        this.portfolioLoaded = false;
    }

    ngOnInit() {
        $('#deleteModal').on('show.bs.modal', function(event) {
            const button = $(event.relatedTarget); // Button that triggered the modal
            const recipient = button.data('whatever'); // Extract info from data-* attributes
            // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            const modal = $(this);
            modal.find('.modal-title').text('New message to ' + recipient);
            modal.find('.modal-body input').val(recipient);
        });
    }

    loadPortfolio() {
        this.api.loadPortfolio$().subscribe(res => {
            this.portfolio = res;
            this.statusText = 'Porteføljen er lastet.';
            this.portfolioLoaded = true;
        });
    }

    savePortfolio() {
        this.api.savePortfolio$(this.portfolio).subscribe(res => {
            this.statusText = 'Porteføljen er lagret.';
        });
    }

    addPosition() {
        this.portfolio.positions.push(this.newPosition);
        this.newPosition = {};
    }

    setPositionToDelete(position: IPosition) {
        this.positionToDelete = position;
    }

    deletePosition(symbol: string) {
        this.portfolio.positions = this.portfolio.positions.filter(position => {
            return position.symbol !== symbol;
        });
        this.positionToDelete = {};
    }
}
