import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

export interface Portfolio {
    purchase_value?: number;
    market_value?: number;
    cash?: number;
    equity?: number;
    positions?: [
        {
            symbol: string;
            shares: number;
            avg_price: number;
        },
    ];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  public portfolio: Portfolio;

  public clientMessage = '';
  public isBroadcast = false;
  public sender = '';

  private socket$: WebSocketSubject<Portfolio>;

  constructor() {

      this.socket$ = new WebSocketSubject('ws://localhost:8999');

      this.socket$
          .subscribe(
          (message) => this.portfolio = message,
          (err) => console.error(err),
          () => console.warn('Completed!')
          );
  }

  ngAfterViewInit(): void {
      this.scroll();
  }

  public toggleIsBroadcast(): void {
      this.isBroadcast = !this.isBroadcast;
  }

  public send(): void {
      const message = {};

      this.socket$.next(message);
      this.clientMessage = '';
      this.scroll();
  }

  public isMine(message: Portfolio): boolean {
      return message !== undefined;
  }

  public getSenderInitials(sender: string): string {
      return sender && sender.substring(0, 2).toLocaleUpperCase();
  }

  public getSenderColor(sender: string): string {
      const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ';
      const initials = this.getSenderInitials(sender);
      const value = Math.ceil((alpha.indexOf(initials[0]) + alpha.indexOf(initials[1])) * 255 * 255 * 255 / 70);
      return '#' + value.toString(16).padEnd(6, '0');
  }

  private scroll(): void {
      setTimeout(() => {
          this.scrollToBottom();
      }, 100);
  }

  private getDiff(): number {
    return -1;
  }

  private scrollToBottom(t = 1, b = 0): void {
  }

}