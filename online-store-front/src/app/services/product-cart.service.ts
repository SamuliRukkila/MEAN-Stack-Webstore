/* Tuotekori-service, joka hoitaa kaikki tuotekoriin liittyvät palvelut. Tuote-
kori ei ole yhteydessä verkkoon eli sen ei tarvitse lähettää HTTP-kutsuja
minnekään. Tuotekori-servicessä voit laskea ostoskorin tuotemäärän, poistaa
tuotteita ostoskorista, lisätä tuotteita tai vaikkapa laskea hinnan. Tuotekori
määräytyy jokaiselle käyttäjälle itsenäisesti. */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import {  ProductCart } from '../dataclasses/ProductCart';

@Injectable({
  providedIn: 'root'
})
export class ProductCartService {

  constructor() { }

  // Subject-oliollinen muuttuja, jota muut komponentit tilaavat
  public productCart = new Subject<ProductCart[]>();

  // Palauttaa tuotekori-muuttujan Observablena sitä tilaaville
  returnProductCart(): Observable<ProductCart[]> {
    return this.productCart.asObservable();
  }

  // Tyhjentää ostoskorin kokonaan
  emptyProductCart(): void {
    sessionStorage.setItem('products', '[]');
    this.productCart.next();
  }


  /*
   POISTA TUOTE TUOTEKORISTA
    Funktio, joka poistaa yksittäisen tuotteen tuotekorista. Funktio käy
    loopissa kaikki tuotekorin tuotteet läpi ja jos se löytää EAN-arvoisen
    parin, poistetaan se arvo tuotekorista. Tuotekorin Subject-olio päivitetään
    myös samalla, jotta muokkaus näkyy automaattisesti käyttäjälle ilman päivitystä.
  */
  removeFromBasket(ean: string) {
    const products = JSON.parse(sessionStorage.getItem('products'));
    for (let i = 0; i < products.length; i++) {
      if (products[i].ean === ean) {
        products.splice([i], 1);
        break;
      }
    }
    sessionStorage.setItem('products', JSON.stringify(products));
    this.productCart.next(products);
  }


  /*
   LASKE TUOTEKORIN KOKONAISHINTA
    Laskee tuotekorin kaikkien tuotteiden yhteishinnan ja palauttaa sen. Funktio
    käy for-loopissa kaikki tuotteet läpi ja plussaa ne paikalliseen muuttujaan.
    Jokainen tuote kerrotaan sen mukaisella määrällä, mitä niitä on valittu.
    Numero palautetaan 2 desimaalin tarkkuudella. Jos tuotteita ei löydy
    palautetaan automaattisesti 0.
  */
  calcPrice(products: ProductCart[]): number {
    let num = 0;
    if (products) {
      for (let i = 0; i < products.length; i++) {
        num += products[i].amount * products[i].price;
      } return Number(num.toFixed(3));
    } return 0;
  }


  /*
   LASKE TUOTEKORIN TUOTEMÄÄRÄ
    Laskee montako tuotetta tuotekorissa on. Funktio käy for-loopissa läpi kaikki
    tuotekorin tuotteet ja ottaa tuotteilta 'amount' -attribuutin numeron vastaan,
    joka lisätään paikalliseen muuttujaan. Jos tuotteita ei löydy palautetaan
    automaattisesti 0.
  */
  countProducts(products: ProductCart[]): number {
    let num = 0;
    if (products) {
      for (let i = 0; i < products.length; i++) {
        num += products[i].amount;
      } return num;
    } return 0;
  }


  /*
   LISÄÄ TUOTE OSTOSKORIIN
    Lisää uuden tuotteen tuotekoriin. Haetaan aluksi SessionStoragesta tuotekori
    ja jos tuotekoria ei ole / se on tyhjä, tehdään uusi tuotekori. Jos tuote
    on jo tuotekorissa lisätään vain sen määrää arvollisesti. Jos tuote on
    uusi lisätään kokonaan uusi olio taulukkoon joka saa määrän 1.
  */
  addToProductCart(product: ProductCart) {
    let newProduct = true;
    const cart = sessionStorage.getItem('products') ?
      JSON.parse(sessionStorage.getItem('products')) : [];
    if (cart.length > 0) {
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].ean === product.ean) {
          // Jos tuote on jo tuotekorissa
          cart[i].amount += 1;
          newProduct = false;
          break;
        }
      }
    }
    // Jos uusi on uusi tuote tuotekorissa
    if (newProduct) {
      product.amount = 1;
      cart.push(product);
    }
    sessionStorage.setItem('products', JSON.stringify(cart));
    this.productCart.next(cart);
  }


  /*
   LISÄÄ VALITUN TUOTTEEN MÄÄRÄÄ
    Funktio lisää tuotteen määrää. Kaikki tuotteet käydään läpi for-loopissa
    jossa valitaan oikea arvo EAN-koodin avulla. Kun EAN löydetään, lisätään
    sen tuotteen määrää yhdellä. (Maksimimäärä 9)
  */
  increaseItemFromBasket(ean: string): void {
    const products = JSON.parse(sessionStorage.getItem('products'));
    for (let i = 0; i < products.length; i++) {
      if (products[i].ean === ean) {
        if (products[i].amount > 8) break;
        products[i].amount += 1;
        break;
      }
    }
    sessionStorage.setItem('products', JSON.stringify(products));
    this.productCart.next(products);
  }


  /*
   VÄHENTÄÄ VALITUN TUOTTEEN MÄÄRÄÄ
    Funktio vähentää tuotteen määrää. Kaikki tuotteet käydään läpi for-loopissa
    jossa valitaan oikea arvo EAN-koodin avulla. Kun EAN löydetään, vähennetään
    sen tuotteen määrää yhdellä. (Minimimäärä 1)
  */
  decreaseItemFromBasket(ean: string): void {
    const products = JSON.parse(sessionStorage.getItem('products'));
    for (let i = 0; i < products.length; i++) {
      if (products[i].ean === ean) {
        if (products[i].amount < 2) break;
        products[i].amount -= 1;
        break;
      }
    }
    sessionStorage.setItem('products', JSON.stringify(products));
    this.productCart.next(products);
  }

}
