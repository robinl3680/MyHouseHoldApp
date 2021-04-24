import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';
import { HeaderComponent } from './header-component/header-component.component';
import { AppRoutingModule } from './app-routing.module';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { DetailedViewComponent } from './purchase-details/detailed-view/detailed-view.component';
import { AuthComponent } from './app-auth/auth.component';
import { LoadingSpinner } from './shared/loading-spinner/loading-spinner';
import { AuthInterceptor } from './app-auth/auth.interceptor.service';
import { FilterComponent } from './filter-component/filter-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TooltipModule } from 'ng2-tooltip-directive';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';
import { ChartsModule } from 'ng2-charts';
import { DetailedDataViewComponent } from './data-analysis/detailed-data-view/detailed-data-view.component';
import { PasswordlessAuthComponent } from './app-auth/phone-login.component';
import { AngularFireModule  } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth'
import { PasswordLengthValidator } from './shared/password-validator';
import { PasswordMisMatchValidator } from './shared/password-mismatch-validator';
import { HandleUserGroupsComponent } from './handle-user-groups/handle-user-groups.component';
import { SliptUpComponent } from './purchase-form/slipt-up/slipt-up.component';

const firebaseConfig = {};
@NgModule({
  declarations: [
    AppComponent,
    PurchaseDetailsComponent,
    HeaderComponent,
    PurchaseFormComponent,
    DetailedViewComponent,
    LoadingSpinner,
    AuthComponent,
    FilterComponent,
    DataAnalysisComponent,
    DetailedDataViewComponent,
    PasswordlessAuthComponent,
    PasswordLengthValidator,
    PasswordMisMatchValidator,
    HandleUserGroupsComponent,
    SliptUpComponent
  ],
  imports: [
    BrowserModule, 
    FormsModule, 
    HttpClientModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    TooltipModule,
    ChartsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
