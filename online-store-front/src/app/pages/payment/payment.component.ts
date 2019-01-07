import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProductCartService } from '../../services/product-cart.service';
import { UserService } from '../../services/user.service';

import { ProductCart } from '../../dataclasses/ProductCart';
import { User } from '../../dataclasses/User';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  // Tuotekorin tuotteet | Käyttäjän tiedot
  public products: ProductCart[];
  public userinfo: User;

  // Root-url kuville
  public imageurl = 'http://localhost:3000/images/';

  // Tilaus onnistui/epäonnistui
  public paymentSuccess: string;
  public paymentFailed: string;

  constructor (
    private productCartService: ProductCartService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getProductCart();
    this.getUserInfo();
  }

  /*
    HAKEE TUOTEKORIN
    -  Servicestä jos sivua ei ole päivitetty (F5)
    -  SessionStoragesta jos sivu on päivitetty eikä tieto ole servicessä
  */
  getProductCart(): void {
    this.productCartService.productCart
      .subscribe(cart => {
        this.products = cart;
    });
    if (!this.products && sessionStorage.getItem('products')) {
      this.products = JSON.parse(sessionStorage.getItem('products'));
    }
  }

  /*
    KÄYTTÄJÄN TIETOJEN HAKU
  */
  getUserInfo(): void {
    this.userService.getUserInfo().subscribe(data => {
      this.userinfo = data;
    }, err => {
      console.error(err);
    });
  }


  // Laskee ostoskorissa olevien tuotteiden yhteishinnan
  calcPrice(products: ProductCart[]): number {
    return this.productCartService.calcPrice(products);
  }
  // Laskee ostoskorissa olevian tuotteiden yhteishinnan, jakaa sen 12:sta,
  // lisää 5 ja pyöristää 2 desimaalin tarkkuuteen
  calcPriceAndRound(products: ProductCart[]): number {
    return Number((this.productCartService.calcPrice(products) / 12 + 5).toFixed(2));
  }
  // Laskee ostokorissa olevien tuotteiden määrän
  countProducts(products: ProductCart[]): number {
    return this.productCartService.countProducts(products);
  }

  /*
    TUOTTEEN POISTO OSTOSKORISTA
  */
  removeFromBasket(ean: string): void {
    this.productCartService.removeFromBasket(ean);
  }

  /*
    TUOTETILAUKSEN LÄHETTÄMINEN
  */
  completeOrder(payment: string): void {
    this.userService.addNewPurchase(payment, this.calcPrice(this.products))
      .subscribe(() => {
        this.paymentSuccess = 'Tilaus onnistui! Vastaanotat vielä \
          sähköpostivarmistuksen sähköpostiisi muutaman minuutin kuluttua.';
        this.productCartService.emptyProductCart();
        setTimeout(() => this.router.navigate(['/etusivu']), 3000);
      }, err => {
          this.paymentFailed = err;
          setTimeout(() => this.paymentFailed = '', 2000);
      });
  }

}
