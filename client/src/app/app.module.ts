import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { registerLocaleData } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProfileComponent } from './profile/profile.component';
import('@angular/common/locales/nb').then(lang => registerLocaleData(lang.default));
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HomeComponent } from './home/home.component';
import { PortfolioEditorComponent } from './portfolio-editor/portfolio-editor.component';
import { HttpClientModule } from '@angular/common/http';
import { ExternalApiComponent } from './external-api/external-api.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AppComponent, NavBarComponent, ProfileComponent, HomeComponent, PortfolioEditorComponent, ExternalApiComponent],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgbModule, FontAwesomeModule, FormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
