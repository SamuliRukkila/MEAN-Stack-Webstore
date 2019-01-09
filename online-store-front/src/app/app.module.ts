// Moduulit
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';

// Normaalit komponentit
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

// App-routing komponentit
import { FrontpageComponent } from './pages/frontpage/frontpage.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProductTypesComponent } from './pages/product-types/product-types.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FaqComponent } from './pages/faq/faq.component';
import { InfoComponent } from './pages/info/info.component';
import { CustomerserviceComponent } from './pages/customerservice/customerservice.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FrontpageComponent,
    FooterComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    ProductDetailComponent,
    ProductTypesComponent,
    AdminComponent,
    PaymentComponent,
    PagenotfoundComponent,
    FaqComponent,
    InfoComponent,
    CustomerserviceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ClickOutsideModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
