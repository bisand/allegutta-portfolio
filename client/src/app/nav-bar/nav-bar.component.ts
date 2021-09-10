import { Component, OnInit } from '@angular/core';
import { faUser, faPowerOff, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
    public faUser = faUser;
    public faEdit = faEdit;
    public faPowerOff = faPowerOff;
    public isMenuCollapsed = true;

    constructor(public auth: AuthService) {
    }

    loginWithRedirect(): void {
        this.auth.loginWithRedirect();
    }

    logoutWithRedirect(): void {
        // const url = this.auth.buildLogoutUrl({ returnTo: `${window.location.origin + '/portfolio/'}` }).subscribe(url => {
        // });
        this.auth.logout({ returnTo: `${window.location.origin + '/portfolio/'}` });
    }

    ngOnInit() { }
}
