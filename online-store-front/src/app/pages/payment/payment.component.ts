import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

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
  public imageurl = environment.imageurl;

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
    Funktio joka hakee tuotekorin tilaamalla Subjectin ProductCartServicestä.
    Jos sivu päivitetään eikä Subjectia päivity, haetaan tieto sen sijaan
    varalta myös SessionStoragesta.
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
   HAKEE KÄYTTÄJÄN TIEDOT
    Funktio, joka hakee kirjautuneen käyttäjän tiedot maksun varmistukseen.
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
  } // Laskee ostoskorissa olevian tuotteiden 12kk kuukausimaksun
  calcPriceAndRound(products: ProductCart[]): number {
    return Number((this.productCartService.calcPrice(products) / 12 + 5).toFixed(2));
  } // Laskeaa kaikki tuotteet
  countProducts(products: ProductCart[]): number {
    return this.productCartService.countProducts(products);
  }


  /*
   TUOTTEEN POISTO OSTOSKORISTA
    Poistaa tuotteen ProductCartServicen avulla tuotekorista.
  */
  removeFromBasket(ean: string): void {
    this.productCartService.removeFromBasket(ean);
  }


  /*
   LISÄÄ TUOTTEEN MÄÄRÄÄ OSTOSKORISSA
    Nimensä mukaan lisää yhden (1) tuotteen jo olemassa olevaan tuotteseen.
  */
  increaseItem(ean: string): void {
    this.productCartService.increaseItemFromBasket(ean);
  }


  /*
   VÄHENTÄÄ TUOTTEEN MÄÄRÄÄ OSTOSKORISSA
    Nimensä mukaan vähentää yhden (1) tuotteen jo olemassa olevasta tuotteesta.
  */
  decreaseItem(ean: string): void {
    this.productCartService.decreaseItemFromBasket(ean);
  }


  /*
   TUOTETILAUKSEN LÄHETTÄMINEN
    Funktio lähettää valmiin tuotetilauksen palvelimeen, jossa se lisätään
    käyttäjän tilaushistoriaan.
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
