import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

import { FrontpageComponent } from './pages/frontpage/frontpage.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProductTypesComponent } from './pages/product-types/product-types.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';



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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
