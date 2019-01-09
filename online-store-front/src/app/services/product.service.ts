/* Tuotteisiin liittyvät servicet. Täältä voit tehdä kaikki CRUD-ominaisuudet
liittyen tuotteisiin. Moneen tuotteen muokkaukseen tarvit ADMIN-autentikaation.
Normaaleihin tuotteiden hakuihin et tarvitse mitään autentikaatiota. */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

import { Product } from '../dataclasses/Product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(public http: HttpClient) {
    this.getToken();
  }

  // Root-url HTTP-kutsuille
  public url = environment.url + 'product/';
  // Autentikaatio-token
  public token: string;


  /*
   HAKEE TOKENIN SESSIONSTORAGESTA
    Tämä funktio ajetaan joka kerta kun komponentti käyttää tätä serviceä.
    Se hakee SessionStoragesta käyttäjälle luovutetun tokenin ja laittaa
    sen paikalliseen muuttujaan.
  */
  getToken(): void {
    const sessValues = sessionStorage.getItem('credentials') ?
    JSON.parse(sessionStorage.getItem('credentials')) : {};
    if (sessValues) this.token = sessValues.token;
  }


  /*
   HAKEE KAIKKI TUOTTEET
    Funktio hakee kaikki tuotteet palvelinpuolelta. Tähän et tarvitse tokenia
    tai edes olla kirjautunut.
  */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 'allproducts')
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   HAKEE TUOTTEEN NIMEN PERUSTEELLA
    Funktio hakee URL-turvallisen (safename) nimen mukaan tuotteen. Funktio
    palauttaa onnistuineissa tilanteissa vain yhden (1) tuotteen käyttäjälle.
  */
  getProduct(safename: string): Observable<Product> {
    return this.http.get<Product>(this.url + 'name/' + safename)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   HAKEE KAIKKI TUOTTEET LAJITYYPIN MUKAAN
    Funktio hakee palvelinpuolelta kaikki tuotteet, jotka ovat tietyn tuotelajin
    (tässä tapauksessa safetype) mukaisia.
  */
  getProductsByType(safetype: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 'type/' + safetype)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   HAKEE KAIKKI TUOTELAJIT
    Funktio hakee kaikki tuotelajit palvelinpuolelta (myös safetypen URL-
    turvallisiin reitityksiin). Tuotelajit eivät ole omassa tietokannassa
    vaan integroitu tuotteiden kanssa. Jos lisätuotelajeja on tarkoitus tehdä,
    joudutaan tietokantahallintasivulla tehdä uusi tuote uudella tuotelajilla.
  */
  getProductTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.url + 'getalltypes')
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   LUO UUDEN TUOTTEEN
    Funktio, joka luo uuden tuotteen Admin-käyttäjän antamien tietojen perusteella.
    Tähän tarvitaan Admin-luokan autentikaatio. Jos tuotteen luominen onnistuu
    luodaan seuraavassa funktiossa tuotteelle kuva.
  */
  createProduct(product: Product): Observable<Product> {
    this.getToken();
    const theaders = { headers: new HttpHeaders({
        'token': this.token, 'Content-Type': 'application/json'
    })};
    return this.http.post<Product>(this.url + 'createproduct', product, theaders)
      .pipe(
        catchError(err => throwError(err)
    ));
  }


  /*
   PÄIVITTÄÄ VANHAN TUOTTEEN
    Funktio, joka päivittää vanhan tuotteen. Turvasyistä (ja hakusyistä) EAN-
    koodia ei voida päivittää. Tarvitaan Admin-luokan autentikaatio. Palauttaa
    päivitetyn tuotteen jos päivitys onnistuu.
  */
  updateProduct(product: Product): Observable<Product> {
    this.getToken();
    const theaders = { headers: new HttpHeaders({
        'token': this.token, 'Content-Type': 'application/json'
    })};
    return this.http.put<Product>(this.url + 'updateproduct', product, theaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   LIITTÄÄ KUVAN LUOTUUN TUOTTEESEEN
    Funktio, joka liittää kuvan juuri luotuun kuvaan. Jos uuden tuotteen luonti
    onnistuu tämä funktio suoritetaan. Kuvasta tehdään uusi FormData, jota
    palvelinpuoli voi ottaa vastaan. Kuvaan liitetään myös oma nimi, joka on
    safetype + .png. Adminin ei siis tarvitse itse nimetä kuvaa vaan se tehdään
    automaattisesti.
  */
  addImageToProduct(imgfile: File, imgname: string): Observable<any> {
    const fd = new FormData();
    fd.append('image', imgfile, imgname);
    return this.http.post(this.url + 'addimage', fd)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   POISTAA TUOTTEEN
    Funktio joka poistaa Admin-käyttäjän valitseman tuotteen EAN-koodin
    perusteella.
  */
  deleteProduct(ean: string, img: string): Observable<any> {
    this.getToken();
    const theaders = { headers: new HttpHeaders({
        'token': this.token
    })};
    return this.http.delete(`${this.url}deleteproduct/${ean}/${img}`, theaders)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
   HAKEE TUOTTEEN/TUOTTEITA HAKUSANAN MUKAAN
    Funktio hakee uusia tuotteita hakusanan (name) mukaan 300ms välein tai kun
    käyttäjän antama termi vaihtuu. Jos hakusana on tyhjä palautetaan tyhjä
    Observable-taulukko, muussa tapauksessa tuotteen / monta tuotetta.
  */
  searchProducts(term: string): Observable<Product[]> {
    // Jos hakusana on tyhjä
    if (!term.trim()) return of ([]);
    return this.http.get<Product[]>(`${this.url}searchproducts/${term}`)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

}
