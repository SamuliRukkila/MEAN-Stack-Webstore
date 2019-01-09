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
  }

  // Rxjs-kirjaston Subject-olio, jolla välitetään tieto kirjautumisesta
  // sen tilaavilla komponenteille
  public logincond = new Subject<string>();

  // Root-osoite kuville
  private url = environment.url + 'user/';


  /*
   HAKEE KIRJAUTUMISTIEDOT
    Funktio hakee kirjautumistiedot (token & email) joka kerta kun komponentti
    käyttää jotain servicen funktiota. Näitä tietoja käytetään kun service tekee
    turvattuja HTTP-kyselyitä.
  */
  getCredentials(): {token: string, email: string} {
    return sessionStorage.getItem('credentials') ?
      JSON.parse(sessionStorage.getItem('credentials')) : {};
  }


  /*
   HAKEE KAIKKI KÄYTTÄJÄT
    Funktio, joka hakee kaikki käyttäjät tietokannasta (pl. salasana). Ko.
    funktio tarvitsee Admin-autentikaation.
  */
  getAllUsers(): Observable<User[]> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
        'token': sess.token, 'email': sess.email
    })};
    return this.http.get<User[]>(this.url + 'allusers', tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   KIRJAUTUNEEN KÄYTTÄJÄN TIETOJEN HAKU
    Funktio, joka hakee käyttäjät omat tiedot. Käyttäjän pitää olla kirjautunut
    sisään, jotta hän voi hakea tietoa itsestään.
  */
  getUserInfo(): Observable<User> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
      'token': sess.token, 'email': sess.email
    })};
    return this.http.get<User>(this.url + 'userinfo', tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   KÄYTTÄJÄN TIETOJEN PÄIVITTÄMINEN
    Funktio ottaa vastaan uudet käyttäjän tiedot, jotka se vie palvelinpuolelle
    ja yrittää päivittää käyttäjän tietoja. Funktioon tarvitsee tavallisen
    token-autentikaation.
  */
  updateUser(data: User, id: string): Observable<any> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
        'token': sess.token
    })};
    return this.http.put(this.url + 'upduser/' + id, data, tokenheaders)
      .pipe(
        catchError(err => throwError(err.error))
    );
  }


  /*
   KÄYTTÄJÄN SALASANAN PÄIVITTÄMINEN
    Funktio joka päivittää käyttäjän salasanan. Salasanojen validointi tehdään
    palvelinpuolella ja tämä funktio palauttaa käyttäjälle viestin onnistumisesta/
    virheestä.
  */
  updateUserPwd(data, id: string): Observable<any> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
        'token': sess.token
    })};
    return this.http.put(this.url + 'updpwd/' + id, data, tokenheaders)
        .pipe(
          catchError(err => throwError(err.error)
    ));
  }


  /*
   KÄYTTÄJÄN POISTAMINEN
    Funktio, joka poistaa käyttäjän. Käyttäjä voi itse tehdä tämän jos kirjoittaa
    salasanan oikein.
    // TODO: Anna Adminille mahdollisuus poistaa käyttäjä ?
  */
  deleteUser(password: string, id: string): Observable<any> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
        'token': sess.token, 'password': password
    })};
    return this.http.delete(this.url + 'deluser/' + id, tokenheaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   TILAUKSEN SIIRTÄMINEN KÄYTTÄJÄN TILAUSHISTORIAAN
    Kun käyttäjä tekee onnistuneen tilauksen, tämä funktio vie sen palvelin-
    puolelle validointiin. Käyttäjälle lähetetään onnistumis/virheviesti
    tilaukssta.
  */
  addNewPurchase(payment: string, price: number): Observable<any> {
    const sess = this.getCredentials();
    const tokenheaders = { headers: new HttpHeaders({
        'token': sess.token
    })};
    const products = JSON.parse(sessionStorage.getItem('products'));
    return this.http.put(this.url + 'addNewPurchase/' + sess.email,
      { products, price, payment }, tokenheaders)
        .pipe(
          catchError(err => throwError(err.error)
    ));
  }

}
