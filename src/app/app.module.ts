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
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

const config = {
    apiKey: "AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI",
    authDomain: "householdapp-7db63.firebaseapp.com",
    databaseURL: "https://householdapp-7db63-default-rtdb.firebaseio.com",
    projectId: "householdapp-7db63",
    storageBucket: "householdapp-7db63.appspot.com",
    messagingSenderId: "960069261796",
    appId: "1:960069261796:web:bc0c061f95f95478928ff1",
    measurementId: "G-HCC7VFJZG5"
};

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
    DetailedDataViewComponent
  ],
  imports: [
    BrowserModule, 
    FormsModule, 
    HttpClientModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    TooltipModule,
    ChartsModule,
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule

  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
