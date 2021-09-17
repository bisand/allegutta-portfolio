import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-portfolio-save',
  templateUrl: './modals.portfolio.save.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsPortfolioSave {

  constructor(public modal: NgbActiveModal) {
  }

}
