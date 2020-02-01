import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  loadPortfolio$(): Observable<any> {
    return this.http.get('/portfolio/api/portfolio');
  }

  test$(): Observable<any> {
    return this.http.get('/portfolio/api/test');
  }

}