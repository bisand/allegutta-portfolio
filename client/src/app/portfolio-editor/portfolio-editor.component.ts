import { Component, OnInit } from '@angular/core';
import { IPortfolio } from '../home/home.component';
import { ApiService } from '../api.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-portfolio-editor',
  templateUrl: './portfolio-editor.component.html',
  styleUrls: ['./portfolio-editor.component.css']
})
export class PortfolioEditorComponent implements OnInit {
  responseJson: string;
  portfolio: IPortfolio;

  faTrash = faTrash;

  constructor(private api: ApiService) {
      this.portfolio = { positions: [] };
  }

  ngOnInit() {}

  loadPortfolio() {
      this.api.loadPortfolio$().subscribe(res => (this.portfolio = res));
  }

  testApi() {
      this.api.test$().subscribe(res => (this.responseJson = res));
  }
}
