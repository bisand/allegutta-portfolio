import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPortfolio } from './home/IPortfolio';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {
    }

    loadPortfolio(): Observable<any> {
        return this.http.get('/portfolio/api/portfolio');
    }

    savePortfolio(portfolio: IPortfolio): Observable<any> {
        return this.http.post('/portfolio/api/portfolio', portfolio, {observe:'events'});
    }

    info(): Observable<any> {
        return this.http.get('/portfolio/api/info');
    }

    loadChart(id: string): Observable<any> {
        const result = this.http.get('/portfolio/api/chart?symbol=' + id);
        return result;
    }
}
