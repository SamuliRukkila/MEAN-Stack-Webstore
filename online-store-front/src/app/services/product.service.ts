/* Tuotteisiin liittyvät servicet. Täältä voit tehdä kaikki CRUD-ominaisuudet
liittyen tuotteisiin. Moneen tuotteen muokkaukseen tarvit ADMIN-autentikaation.
Normaaleihin tuotteiden hakuihin et tarvitse mitään autentikaatiota. */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

import { Product } from '../dataclasses/Product';

const headers = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

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
  */
  getToken(): void {
    const sessValues = sessionStorage.getItem('credentials') ?
    JSON.parse(sessionStorage.getItem('credentials')) : {};
    if (sessValues) this.token = sessValues.token;
  }

  /*
    HAKEE KAIKKI TUOTTEET
  */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 'allproducts')
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

  /*
    HAKEE TUOTTEEN NIMEN PERUSTEELLA (safename)
  */
  getProduct(safename: string): Observable<Product> {
    return this.http.get<Product>(this.url + 'name/' + safename, headers)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }


  /*
    HAKEE KAIKKI TUOTTEET TUOTELAJIN PERUSTEELLA
  */
  getProductsByType(safetype: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 'type/' + safetype, headers)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

  /*
    HAKEE KAIKKI TUOTELAJIT/TYYPIT
  */
  getProductTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.url + 'getalltypes', headers)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

  /*
    LUO UUDEN TUOTTEEN
  */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.url + 'createproduct', product, headers)
      .pipe(
        catchError(err => throwError(err)
    ));
  }

  /*
    PÄIVITTÄÄ VANHAN TUOTTEEN
  */
  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.url + 'updateproduct', product, headers)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

  /*
    LIITTÄÄ KUVAN JUURI LUOTUUN TUOTTEESEEN
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
  */
  deleteProduct(ean: string, img: string): Observable<any> {
    return this.http.delete(`${this.url}deleteproduct/${ean}/${img}`)
      .pipe(
        catchError(err => throwError(err.error)
    ));
  }

  /*
    HAKEE TUOTTEITA TIETYN SANAN MUKAAN (name)
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
