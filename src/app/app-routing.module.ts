import { Routes, RouterModule } from "@angular/router";
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';
import { NgModule } from '@angular/core';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { AuthComponent } from './app-auth/auth.component';
import { AuthGuard } from './app-auth/auth.guard';
import { AppResolver } from './app-resolver.service';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';
import { DetailedDataViewComponent } from './data-analysis/detailed-data-view/detailed-data-view.component';
import { HandleUserGroupsComponent } from "./handle-user-groups/handle-user-groups.component";
import { PasswordlessAuthComponent } from "./app-auth/phone-login.component";
import { AppIntroductionComponent } from './app-introduction/app-introduction.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: AppIntroductionComponent, pathMatch: 'full' },
  {
    path: 'purchase-form/:id',
    component: PurchaseFormComponent,
    canActivate: [AuthGuard],
    resolve: [AppResolver],
  },
  {
    path: 'purchase-details/:id',
    component: PurchaseDetailsComponent,
    resolve: [AppResolver],
    canActivate: [AuthGuard],
  },
  {
    path: 'data-analysis/:id',
    component: DataAnalysisComponent,
    canActivate: [AuthGuard],
    resolve: [AppResolver],
    children: [
      {
        path: 'detailed-data-view',
        component: DetailedDataViewComponent,
        resolve: [AppResolver],
      },
    ],
  },
  { path: 'phone-auth', component: PasswordlessAuthComponent },
  {
    path: 'groups-view',
    component: HandleUserGroupsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '' },
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
