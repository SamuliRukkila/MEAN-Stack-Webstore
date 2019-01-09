import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

import { User } from '../../dataclasses/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // Kertoo käyttäjälle, että hänen haluamiaan muutoksia ollaan
  // tekemässä visuaalisesti
  public processing = false;

  // Root-osoite kuville
  public imageurl = environment.imageurl;

  // Käyttäjän tietojen haku epäonnistui
  public getUserInfoFailed: string;

  // Tietojen päivitys onnistuminen/epäonnistuminen
  public updSuccess: string;
  public updFailed: string;

  // Salasanan päivitys onnistuminen/epäonnistuminen
  public pwdUpdateSuccess: string;
  public pwdUpdateFailed: string;

  // Käyttäjän poisto onnistuminen/epäonnistuminen
  public deleteAccountSuccess: string;
  public deleteAccountFailed: string;

  // Käyttäjän tiedot
  public user: User;


  constructor (
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }

  /*
   KÄYTTÄJÄN TIETOJEN HAKEMINEN
    Funktio, joka hakee käyttäjän tiedot paikalliseen muuttujaan, jotta ne
    voidaan tulostaa käyttäjälle muokattavaksi sekä katsottavaksi.
  */
  getUserInfo(): void {
    this.userService.getUserInfo().subscribe(data => {
      this.updateFields(data);
      }, err => {
        this.getUserInfoFailed = err;
        setTimeout(() => this.getUserInfoFailed = '', 2000);
    });
  }


  /*
   KÄYTTÄJÄLLE NÄKYVIEN LOMAKKEIDEN ARVOJEN PÄIVITTÄMINEN
    Funktiota kutsutaan useasti, jotta päivitykseen ei tarvita tilausta.
    Parametrina saadaan päivittynyt käyttäjä, joka tulostetaan lomakkeeseen.
  */
  updateFields(data: User): void {
    this.user = data;
  }


  /*
   KÄYTTÄJÄN TIETOJEN PÄIVITTÄMINEN
    Funktio joka päivittää osan tai kaikki (pl. _id, salasana & email) käyttäjän
    tiedosista.
  */
  updateValues(fData: User): void {
    this.processing = true;
    this.userService.updateUser(fData, this.user._id).subscribe(res => {
      this.updateFields(res);
      this.processing = false;
      this.updSuccess = 'Päivitetty';
      setTimeout(() => this.updSuccess = '', 2000);
      }, err => {
        this.processing = false;
        this.getUserInfo();
        this.updFailed = err;
        setTimeout(() => this.updFailed = '', 2000);
    });
  }


  /*
   KÄYTTÄJÄN SALASANAN PÄIVITTÄMINEN
    Funktio joka päivittää käyttäjän salasanan uuteen salasanaan. Heti alussa
    katsotaan, etteivät salasanat ovat samoja.
  */
  updatePwd(fData): void {
    if (fData.oldPwd === fData.newPwd) {
      this.pwdUpdateFailed = 'Salasana ei voi olla sama';
      setTimeout(() => this.pwdUpdateFailed = '', 2000);
    } else {
      this.processing = true;
      this.userService.updateUserPwd(fData, this.user._id)
        .subscribe(() => {
          this.processing = false;
          this.pwdUpdateSuccess = 'Salasana päivitetty';
          setTimeout(() => this.pwdUpdateSuccess = '', 2000);
          }, err => {
              this.processing = false;
              this.pwdUpdateFailed = err;
              setTimeout(() => this.pwdUpdateFailed = '', 2000);
        });
     }
  }


  /*
   KÄYTTÄJÄN POISTAMINEN
    Funktio joka poistaa käyttäjän tietokannasta kokonaan. Alussa varmistetaan
    etteivät salasanat ovat samoja. Käyttäjä viedään etusivulle, sekä kirjataan
    ulos.
  */
  deleteUser(fData): void {
    if (fData.password !== fData.rePassword) {
      this.deleteAccountFailed = 'Salasanat eivät täsmänneet';
      setTimeout(() => this.deleteAccountFailed = '', 2000);
    } else {
      this.processing = true;
      this.userService.deleteUser(fData.password, this.user._id)
        .subscribe(res => {
          this.processing = false;
          this.deleteAccountSuccess = res;
          sessionStorage.removeItem('credentials');
          this.authService.logOut();
          setTimeout(() => this.router.navigate(['/etusivu']), 1000);
        }, err => {
            this.processing = false;
            this.deleteAccountFailed = err;
            setTimeout(() => this.deleteAccountFailed = '', 2000);
      });
    }
  }

}
