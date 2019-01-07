/*

Angularin Auth-Guard moduuli, joka suojelee turvattuja sivuja. Ko. moduuli
tuodaan routingiin mukaan, jossa tietyissä valituissa osoitteissa tarkastetaan
aluksi käyttäjän autentikaatio ennenkuin heidät päästetään sivulle.

Käyttäjät voivat joko olla normaaleja käyttäjiä, jotka pystyvät katsomaan
tietojaan, kirjautumaan tai tekemään normaaleja asioita web-sovelluksessa.

Admin-käyttäjät pystyvät näkemään jokaisen käyttäjän, sekä muokkaamaan CRUD
-toiminnoilla tietokantaa.

Käyttäjien välillä kutsututaan omia metodeja.

*/

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


  // Auth-guardin oma funktio, joka aktivoituu kun käyttäjä koittaa päästä
  // suojattuun sivustoon.
  canActivate (
    _next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
      // Tallennetaan muuttujaan URL-sivu, johon koitettiin päästä
      const url: string = _state.url;
      // Jos käyttäjä koittaa päästä admin-sivulle tehdään admin-autentikaatio
      if (url === '/admin') {
        return this.checkAdminLogin(url);
      }
      // Normaalin käyttäjän autentikaatio
      return this.checkLogin(url);
  }


  /*
   VARMISTAA ADMIN-KÄYTTÄJÄN AUTENTIKAATION
    Funktio, joka tarkastaa onko admin-sivulle pyrkivä henkilö admin. Jos
    sessionStorage sisältää arvoparin Credentials kokeillaan toista ehtolauseketta,
    jota kutsutaan AuthServicestä. Jos tämä funktio palauttaa truen, palautetaan
    true routerille, joka päästää käyttäjän admin-sivustoon.
  */
  checkAdminLogin(url: string): boolean {
    if (sessionStorage.getItem('credentials') &&
     this.authService.isAdminAuthenticated()) {
       console.log('Admin-autentikaatio osoitteeseen: ' + url);
       return true;
     }
     console.log('Ei admin-autentikaatiota osoitteeseen: ' + url);
     // Tässä ei ohjata login-sivulle vaan suoraan etusivulle
     this.router.navigate(['/etusivu']);
     return false;
  }


  /*
   VARMISTAA KÄYTTÄJÄN AUTENTIKAATION
    Funktio, joka tarkastaa tavallisen käyttäjän autentikaation. Aluksi katsotaan,
    että sessionStorage sisältää arvoparin Credentials. Jos tämä on true niin
    kutsutaan AuthServicen autentikaatiofunktiota. Jos kummatkin on tosi,
    palautetaan true routerille.
  */
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
