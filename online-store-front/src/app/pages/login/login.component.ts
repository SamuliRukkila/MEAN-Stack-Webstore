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
  }

  /*
    KIRJAUTUMINEN
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
