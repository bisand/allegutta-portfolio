import { Component, OnInit } from '@angular/core';
import { faUser, faPowerOff, faEdit } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
    isCollapsed = true;
    faUser = faUser;
    faEdit = faEdit;
    faPowerOff = faPowerOff;

    constructor(public auth: AuthService) {}

    ngOnInit() {}
}
