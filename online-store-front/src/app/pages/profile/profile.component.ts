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
  */
  updateFields(data: User): void {
    this.user = data;
  }


  /*
    KÄYTTÄJÄN TIETOJEN PÄIVITTÄMINEN
  */
  updateValues(fData: User): void {
    if (fData === this.user) {
      alert('ei samoja!');
    } else {
    this.userService.updateUser(fData, this.user._id).subscribe(res => {
      this.updateFields(res);
      this.updSuccess = 'Päivitetty';
      setTimeout(() => this.updSuccess = '', 2000);
      }, err => {
        this.getUserInfo();
        this.updFailed = err;
        setTimeout(() => this.updFailed = '', 2000);
    });
    }
  }


  /*
    KÄYTTÄJÄN SALASANAN PÄIVITTÄMINEN
  */
  updatePwd(fData): void {
    if (fData.oldPwd === fData.newPwd) {
      this.pwdUpdateFailed = 'Salasana ei voi olla sama';
      setTimeout(() => this.pwdUpdateFailed = '', 2000);
    } else {
      this.userService.updateUserPwd(fData, this.user._id)
        .subscribe(() => {
          this.pwdUpdateSuccess = 'Salasana päivitetty';
          setTimeout(() => this.pwdUpdateSuccess = '', 2000);
          }, err => {
              this.pwdUpdateFailed = err;
              setTimeout(() => this.pwdUpdateFailed = '', 2000);
        });
     }
  }


  /*
    KÄYTTÄJÄN POISTAMINEN
  */
  deleteUser(fData): void {
    if (fData.password !== fData.rePassword) {
      this.deleteAccountFailed = 'Salasanat eivät täsmänneet';
      setTimeout(() => this.deleteAccountFailed = '', 2000);
    } else {
      this.userService.deleteUser(fData.password, this.user._id)
        .subscribe(res => {
          this.deleteAccountSuccess = res;
          sessionStorage.removeItem('credentials');
          this.authService.logOut();
          setTimeout(() => this.router.navigate(['/etusivu']), 1000);
        }, err => {
            this.deleteAccountFailed = err;
            setTimeout(() => this.deleteAccountFailed = '', 2000);
      });
    }
  }

}
