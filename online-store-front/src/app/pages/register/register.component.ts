import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Register } from '../../dataclasses/Register';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Rekisteröinti onnistuminen/epäonnistuminen
  public regSuccess: string;
  public regFailed: string;

  // Kertoo visuaalisesti ollaanko tietoa prosessoimassa rek. ohella
  public processing = false;

  // Toinen salasana two-way-binding metodilla turvassa
  public repassword: string;

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLogin();
  }


  /*
   TARKISTAA KIRJAUTUNEISUUDEN
    Jos käyttäjä on jo kirjautunut sisään ja hän koittaa navigoida Rekisteröidy-
    sivustolle, uudelleenohjataan hänet etusivulle. Rekisteröitymisen pitäisi
    olla mahdollista vain kuin käyttäjä ei ole kirjautunut sisään.
  */
  checkLogin(): void {
    if (sessionStorage.getItem('credentials')) {
      this.router.navigate(['/etusivu']);
    }
  }


  /*
   REKISTERÖITYMINEN
    Funktio joka rekisteröi käyttäjän kun tarvittava informaatio on kerätty.
    Jos rekisteröityminen onnistuu, viedään käyttäjä suoraan kirjautumissivulle.
  */
  register(fData: Register): void {
    if (fData.password !== this.repassword) {
      this.regFailed = 'Salasanat eivät täsmänneet';
      setTimeout(() => this.regFailed = '', 2000);
    } else {
      this.processing = true;
      this.authService.register(fData)
        .subscribe(() => {
          this.processing = false;
          this.regSuccess = 'Rekisteröityminen onnistui';
          setTimeout(() => this.router.navigate(['/kirjaudu']), 1000);
        }, err => {
          this.processing = false;
          console.log(err);
          this.regFailed = err;
          setTimeout(() => this.regFailed = '', 2000);
      });
    }
  }

}
