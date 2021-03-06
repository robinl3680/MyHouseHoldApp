import { Routes, RouterModule } from "@angular/router";
import { AppComponent } from './app.component';
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';
import { NgModule } from '@angular/core';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { DetailedViewComponent } from './purchase-details/detailed-view/detailed-view.component';
import { AuthComponent } from './app-auth/auth.component';
import { AuthGuard } from './app-auth/auth.guard';
import { AppResolver } from './app-resolver.service';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';
import { AuthService } from './app-auth/auth.service';
import { DetailedDataViewComponent } from './data-analysis/detailed-data-view/detailed-data-view.component';
import { PasswordlessAuthComponent } from "./app-auth/phone-login.component";

const routes: Routes = [
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: 'phone-auth', component:PasswordlessAuthComponent},
    { path: 'purchase-form', component: PurchaseFormComponent, canActivate: [AuthGuard] },
    { path: 'purchase-details', component: PurchaseDetailsComponent, resolve: [AppResolver], canActivate: [AuthGuard],
      children: [
          { path: ':id', component: DetailedViewComponent }
      ] },
    { path: 'purchase-form/:id', component: PurchaseFormComponent, canActivate: [AuthGuard], resolve: [AppResolver] },
    { path: 'data-analysis', component: DataAnalysisComponent, canActivate: [AuthGuard], resolve: [AppResolver], 
        children: [
            { path: 'detailed-data-view', component: DetailedDataViewComponent, resolve: [AppResolver] }
        ] 
    },
    { path: 'auth', component: AuthComponent },
    { path: '**', redirectTo: 'auth' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {

}
