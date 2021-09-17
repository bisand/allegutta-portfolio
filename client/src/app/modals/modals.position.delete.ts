import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPosition } from '../home/IPosition';

@Component({
  selector: 'modal-position-delete',
  templateUrl: './modals.position.delete.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsPositionDelete {
  public positionToDelete: IPosition;
  constructor(public modal: NgbActiveModal) {
  }

}
