import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPortfolio } from './home/home.component';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {}

    loadPortfolio$(): Observable<any> {
        return this.http.get('/portfolio/api/portfolio');
    }

    savePortfolio$(portfolio: IPortfolio): Observable<any> {
        return this.http.post('/portfolio/api/portfolio', portfolio);
    }

    test$(): Observable<any> {
        return this.http.get('/portfolio/api/test');
    }
}
