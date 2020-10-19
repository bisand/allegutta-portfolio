import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs/Observable';
import { retryWhen, tap, delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    private webSocketUrl: string;
    private socket$: Observable<unknown> = null;

    constructor() {
        const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.webSocketUrl = socketProtocol + '//' + window.location.hostname + ':' + window.location.port;
        this.webSocketUrl += '/portfolio/ws/';
    }

    public init(): Observable<unknown> {
        if (this.socket$) {
            return this.socket$;
        }
        this.socket$ = this.createWebSocket$(this.webSocketUrl).pipe(
            retryWhen(errors =>
                errors.pipe(
                    tap(err => {
                        console.warn('An error occurred. Will try to reconnect in 10 seconds.', err);
                    }),
                    delay(10000),
                ),
            ),
        );
        return this.socket$;
    }

    private createWebSocket$(uri: string): Observable<unknown> {
        return new Observable<unknown>(observer => {
            try {
                const socket = webSocket(uri);

                const subscription = socket.asObservable().subscribe(
                    data => observer.next(data),
                    error => observer.error(error),
                    () => observer.complete(),
                );

                const command = { command: 'start' };
                socket.next(command);

                return () => {
                    if (!subscription.closed) {
                        subscription.unsubscribe();
                    }
                };
            } catch (error) {
                observer.error(error);
            }
        });
    }
}
