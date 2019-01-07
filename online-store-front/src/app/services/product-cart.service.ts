import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { ProductCart } from '../dataclasses/ProductCart';

@Injectable({
  providedIn: 'root'
})
export class ProductCartService {

  constructor() { }

  // Subject-oliollinen muuttuja, jota muut komponentit tilaavat
  public productCart = new Subject<ProductCart[]>();


  /*
    POISTA TUOTE TUOTEKORISTA
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

  // Palauttaa tuotekori-muuttujan Observablena sitä tilaaville
  returnProductCart(): Observable<ProductCart[]> {
    return this.productCart.asObservable();
  }

  // Tyhjentää ostoskorin kokonaan
  emptyProductCart(): void {
    sessionStorage.setItem('products', '[]');
    this.productCart.next();
  }

}
