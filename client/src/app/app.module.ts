import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CommonModule, registerLocaleData } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProfileComponent } from './profile/profile.component';
import('@angular/common/locales/nb').then(lang => registerLocaleData(lang.default));
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HomeComponent, NgbdSortableHeader } from './home/home.component';
import { PortfolioEditorComponent } from './portfolio-editor/portfolio-editor.component';
import { HttpClientModule } from '@angular/common/http';
import { ExternalApiComponent } from './external-api/external-api.component';
import { FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import * as $ from 'jquery';
import { LinechartComponent } from './linechart/linechart.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
    declarations: [AppComponent, NavBarComponent, ProfileComponent, HomeComponent, PortfolioEditorComponent, ExternalApiComponent, LinechartComponent, HomeComponent, NgbdSortableHeader],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule, FontAwesomeModule, FormsModule, ChartsModule, BrowserModule, CommonModule],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
    bootstrap: [AppComponent],
})
export class AppModule { }
