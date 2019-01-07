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

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  /*
    REKISTERÖITYMINEN
  */
  register(fData: Register): void {
    this.authService.register(fData)
      .subscribe(() => {
        this.regSuccess = 'Rekisteröityminen onnistui';
        setTimeout(() => this.router.navigate(['/kirjaudu']), 1000);
      }, err => {
        console.log(err);
        this.regFailed = err;
        setTimeout(() => this.regFailed = '', 2000);
    });
  }

}
