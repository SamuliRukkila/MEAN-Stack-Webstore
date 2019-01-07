// Guard -moduuli, joka suojaa List-komponenttia, ellet ole kirjautunut sisään.
// Keskustelee pääasiassa Router-moduulin sekä Auth -servicen kanssa.

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router} from '@angular/router';

// Tuodaan service mikä keskustelee komponenttejen välillä
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  // Tämä metodi suoritetaan kun koitetaan päästä 'Add' -sivulle. Palauttaa
  // true/false.
  canActivate (
    _next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
      // Tallennetaan muuttujaan URL-sivu, johon koitettiin päästä
      const url: string = _state.url;
      if (url === '/admin') {
        return this.checkAdminLogin(url);
      }
      return this.checkLogin(url);
  }

  checkAdminLogin(url: string): boolean {
    if (sessionStorage.getItem('credentials') &&
     this.authService.isAdminAuthenticated()) {
       console.log('Admin-autentikaatio osoitteeseen: ' + url);
       return true;
     }
     console.log('Ei admin-autentikaatiota osoitteeseen: ' + url);
     this.router.navigate(['/etusivu']);
     return false;
  }

  // Tämä katsoo auth.servicen muuttujaa (isLoggedIn). Jos muuttuja on false,
  // viedään käyttäjä kirjautunut sivulle -- muuten käyttäjä voi jatkaa sivulle
  // normaalisti.
  checkLogin(url: string): boolean {
    if (sessionStorage.getItem('credentials') &&
     this.authService.isAuthenticated()) {
      console.log('Normaali autentikaatio osoitteeseen: ' + url);
      return true;
    }
    console.log('Ei autentikaatiota osoitteeseen: ' + url);
    // Tallennetaan URL mihin haluttiin navigoida
    this.authService.redirectUrl = url;
    // Navigoi Login -sivulle
    this.router.navigate(['/kirjaudu']);
    // Tämä palautuu canActivaten() metodikutsuun eli canActivate() palauttaa
    // loppujen lopuksi falsen -> pääsy kielletty.
    return false;
  }
}
