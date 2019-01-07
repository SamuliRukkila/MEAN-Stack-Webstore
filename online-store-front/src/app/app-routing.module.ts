import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Komponentit
import { FrontpageComponent } from './pages/frontpage/frontpage.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProductTypesComponent } from './pages/product-types/product-types.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';

// Auth Guard
import { AuthGuard } from './guards/auth.guard';

// Sivuston urlit
const routes: Routes = [
  { path: 'etusivu', component: FrontpageComponent },
  { path: 'kirjaudu', component: LoginComponent },
  { path: 'profiili', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'rekisteroidy', component: RegisterComponent },
  { path: 'tuote/:safename', component: ProductDetailComponent },
  { path: 'tuotelaji/:safetype', component: ProductTypesComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'maksu', component: PaymentComponent, canActivate: [AuthGuard] },
  // Pääsivu johon viedään kun käyttäjä on root-urlissa
  { path: '', redirectTo: '/etusivu', pathMatch: 'full' },
  // Url jota ei ole olemassa
  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
