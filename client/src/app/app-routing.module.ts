import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { PortfolioEditorComponent } from './portfolio-editor/portfolio-editor.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './interceptor.service';
import { ExternalApiComponent } from './external-api/external-api.component';
import { LinechartComponent } from './linechart/linechart.component';
import { AuthGuard } from '@auth0/auth0-angular';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'chart/:id',
        component: LinechartComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'portfolio-editor',
        component: PortfolioEditorComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'external-api',
        component: ExternalApiComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {  })],
    exports: [RouterModule],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true,
        },
    ],
})
export class AppRoutingModule {}
