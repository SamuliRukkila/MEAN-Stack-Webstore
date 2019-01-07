import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { ProductCartService } from '../services/product-cart.service';

import { Product } from '../dataclasses/Product';
import { ProductCart } from '../dataclasses/ProductCart';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // Root-osoite kuville
  public imageurl = 'http://localhost:3000/images/';

  public admin = false;
  // Sisältää käyttäjän nimen jos kirjautnut sisään
  public login: string;

  // Tuotelajt | Tuotekori
  public productTypes: Object[];
  public productCart: ProductCart[];

  // Hakusanan tuottamat tuotteet (asynkroninen) | Hakusana (Xrjs Subject-olio)
  public products$: Observable<Product[]>;
  private searchTerms = new Subject<string>();


  constructor (
    private authService: AuthService,
    private productService: ProductService,
    private productCartService: ProductCartService
  ) {}

  ngOnInit() {
    this.checkLoginState();
    this.checkAdminState();
    this.getProductTypes();
    this.getProductCart();

    // Hakusanalla tuotteen etsiminen => joka kerta kun käyttäjä antaa uuden
    // hakusanan, joka ei ole A) sama kuin edellinen hakulause tai
    // B) tyhjä, tekee funktio HTTP-kyselyn (servicen) kautta tietokantaan,
    // joka palauttaa tuotteen, jos semmoinen löytyy hakusanalla. Funktio
    // tutkii 300ms:n välein onko hakulause vaihtunut. Tuote/tuotteet liitetään
    // muuttujaan, joka tulostetaan hakuvalikon alapuolelle
    this.products$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.productService.searchProducts(term))
    );
  }

  // Laskee ostoskorissa olevien tuotteiden yhteishinnan
  calcPrice(products: ProductCart[]): number {
    return this.productCartService.calcPrice(products);
  }
  // Laskee ostokorissa olevien tuotteiden määrän
  countProducts(products: ProductCart[]): number {
    return this.productCartService.countProducts(products);
  }

  // Hakulauseessa olevan Subject-olion käytänne, jossa uusi hakusana tuotteille
  // tulee vanhan hakusanan tilalle
  search(term: string): void {
    this.searchTerms.next(term);
  }


  /*
    HAKEE TUOTEKORIN
    -  Servicestä jos sivua ei ole päivitetty (F5)
    -  SessionStoragesta jos sivu on päivitetty eikä tieto ole servicessä
  */
  getProductCart(): void {
    this.productCartService.productCart
      .subscribe(cart => {
        this.productCart = cart;
    });
    if (!this.productCart && sessionStorage.getItem('products')) {
      this.productCart = JSON.parse(sessionStorage.getItem('products'));
    }
  }


  /*
    HAKEE TIEDON ONKO KÄYTTÄJÄ KIRJAUTUNUT SISÄÄN
    -  Servicestä jos sivua ei ole päivitetty (F5)
    -  SessionStoragesta jos sivu on päivitetty eikä tieto ole servicessä
  */
  checkLoginState(): void {
    this.authService.returnLoginCond()
    .subscribe(cond => this.login = cond);
    if (!this.login && sessionStorage.getItem('credentials')) {
      const sessvalues = JSON.parse(sessionStorage.getItem('credentials'));
      this.login = sessvalues.name;
    }
  }


  checkAdminState(): void {
    this.authService.returnAdminCond()
      .subscribe(cond => this.admin = cond);
    if (!this.admin && this.authService.isAdminAuthenticated()) {
      this.admin = true;
    }
  }


  /*
    POISTAA TUOTTEEN OSTOSKORISTA
  */
  removeFromBasket(ean: string): void {
    this.productCartService.removeFromBasket(ean);
  }

  /*
    HAKEE KAIKKI TUOTELAJIT
  */
  getProductTypes(): void {
    this.productService.getProductTypes()
      .subscribe(type => this.productTypes = type),
        err => console.error(err);
  }

  /*
    KIRJAA KÄYTTÄJÄN SISÄÄN
  */
  logout() {
    this.login = null;
    this.authService.logOut();
    sessionStorage.removeItem('credentials');
  }
}
