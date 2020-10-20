import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
    private whitelistedUrls: Array<string> = ['/portfolio/api/info', '/portfolio/api/chart', '/portfolio/version.json'];
    constructor(private auth: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.whitelistedUrls.findIndex((element: string) => req.url.includes(element)) > -1) {
            return next.handle(req);
        }
        return this.auth.getAccessTokenSilently().pipe(
            mergeMap(token => {
                const tokenReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` },
                });
                return next.handle(tokenReq);
            }),
            catchError(err => throwError(err)),
        );
    }
}
