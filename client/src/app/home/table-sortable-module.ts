import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgbdSortableHeader, HomeComponent } from './home.component';

@NgModule({
  imports: [BrowserModule, CommonModule, NgbModule],
  declarations: [HomeComponent, NgbdSortableHeader],
  exports: [HomeComponent],
  bootstrap: [HomeComponent]
})
export class NgbdTableSortableModule {}
