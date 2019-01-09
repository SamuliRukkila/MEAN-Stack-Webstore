import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Kirjautuminen käynnissä | Kirjautuminen epäonnistui
  public logInfo: string;
  public logFailed: string;


  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLogin();
  }


  /*
   TARKISTAA KIRJAUTUNEISUUDEN
    Jos käyttäjä on jo kirjautunut sisään ja hän koittaa navigoida Kirjaudu-
    sivustolle, uudelleenohjataan hänet etusivulle. Tuplakirjautumisessa ei
    kävisi muuta kuin, että vanhat tiedot ylikirjoitettaisiin, mutta on hyvä
    käytänne kirjautua ulos ennenkuin kirjautuu toiselle käyttäjälle.
  */
  checkLogin(): void {
    if (sessionStorage.getItem('credentials')) {
      this.router.navigate(['/etusivu']);
    }
  }


  /*
   KIRJAUTUMINEN
    Funktio kirjaa käyttäjän sisälle ottaen lomakkeen datan mukaan. Jos
    käyttäjä on uudelleenohjattu sivustolle huonon autentikaation takia ja
    hän kirjautuu onnistuneesti sisään, viedään hänet sivulle, jolle hän oli
    navigoimassa (pl. admin sivut).
  */
  login(fData): void {
    this.logInfo = 'Kirjaudutaan sisään..';
    this.authService.login(fData)
      .subscribe(() => {
        // Jos koitettiin aikaisemmin navigoida johonkin sivulle
        const dest = this.authService.redirectUrl ?
          this.authService.redirectUrl : '/etusivu';
        this.router.navigate([dest]);
      }, err => {
        this.logInfo = '';
        this.logFailed = err;
        setTimeout(() => this.logFailed = '', 2000);
      });
  }

}
