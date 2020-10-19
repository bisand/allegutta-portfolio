import { Component, OnInit, enableProdMode } from '@angular/core';
import { VersionCheckService } from './version-check.service';
import { } from '@angular/core';

enableProdMode();

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    constructor(private versionCheckService: VersionCheckService) { }
    ngOnInit(): void {
        this.versionCheckService.initVersionCheck('/portfolio/version.json', 1000 * 60 * 1);
    }
}
