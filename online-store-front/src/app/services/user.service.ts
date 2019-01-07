import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

import { User } from '../dataclasses/User';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
    this.getCredentials();
  }


  // Rxjs-kirjaston Subject-olio, jolla välitetään tieto kirjautumisesta
  // sen tilaavilla komponenteille
  public logincond = new Subject<string>();

  // Käyttäjän token sekä sähköposti
  private token: string;
  private email: string;

  // Root-osoite kuville
  private url = environment.url + 'user/';


  /*
    HAKEE KIRJAUTUMISEEN LIITTYVÄN DATAN SESSIONSTORAGESTA
  */
  getCredentials(): void {
    const sessValues = sessionStorage.getItem('credentials') ?
      JSON.parse(sessionStorage.getItem('credentials')) : {};
    if (sessValues) {
      this.token = sessValues.token;
      this.email = sessValues.email;
    }
  }


  /*
    KAIKKIEN KÄYTTÄJIEN HAKU
  */
  getAllUsers(): Observable<User[]> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token, 'email': this.email
    })};
    return this.http.get<User[]>(this.url + 'allusers', tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
    KIRJAUTUNEEN KÄYTTÄJÄN TIETOJEN HAKU
  */
  getUserInfo(): Observable<User> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token, 'email': this.email
    })};
    return this.http.get<User>(this.url + 'userinfo', tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
    KÄYTTÄJÄN TIETOJEN PÄIVITTÄMINEN
  */
  updateUser(data: User, id: string): Observable<any> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token
    })};
    return this.http.put(this.url + 'upduser/' + id, data, tokenheaders)
      .pipe(
        catchError(err => throwError(err.error))
    );
  }


  /*
    KÄYTTÄJÄN SALASANAN PÄIVITTÄMINEN
  */
  updateUserPwd(data, id: string): Observable<any> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token
    })};
    return this.http.put(this.url + 'updpwd/' + id, data, tokenheaders)
        .pipe(
          catchError(err => throwError(err.error)
    ));
  }


  /*
    KÄYTTÄJÄN POISTAMINEN
  */
  deleteUser(password: string, id: string): Observable<any> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token, 'password': password
    })};
    return this.http.delete(this.url + 'deluser/' + id, tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
    TILAUKSEN SIIRTÄMINEN KÄYTTÄJÄN TILAUSHISTORIAAN
  */
  addNewPurchase(payment: string, price: number): Observable<any> {
    const tokenheaders = { headers: new HttpHeaders({
        'token': this.token
    })};
    const products = JSON.parse(sessionStorage.getItem('products'));
    return this.http.put(this.url + 'addNewPurchase/' + this.email,
      { products, price, payment }, tokenheaders)
        .pipe(
          catchError(err => throwError(err.error)
    ));
  }


}
