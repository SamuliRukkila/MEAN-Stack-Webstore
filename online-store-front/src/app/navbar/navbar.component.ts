import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { NgForm } from '@angular/forms';

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
  public imageurl = environment.imageurl;

  // Käyttäjän nimi | Onko admin
  public login: string;
  public admin = false;

  // Tuotelajt | Tuotekori
  public productTypes: Object[];
  public productCart: ProductCart[];

  // Hakusanan tuottamat tuotteet (asynkroninen) | Hakusana (Xrjs Subject-olio)
  public products$: Observable<Product[]>;
  private searchTerms = new Subject<string>();

  // Onko haku käynnissä
  public search_session = true;
  // Mennäänkö suoraan tuotekorista maksuun
  public basketToProceedSession = true;

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


  // Kun käyttäjä etsii näytetään tuotteet jotka vastaavat hakua, tämä muutetaan
  // kuitenkin hetkellisesti Falseksi kun käyttäjä klikkaa tuotetta TAI
  // kun käyttäjä klikkaa pois hausta
  resetForm(form: NgForm): void {
    this.search_session = false;
    setTimeout(() => this.search_session = true, 1000);
    form.reset();
  }

  // Normaalisti tuotekori-menu ei sulkeudu, jos käyttäjä navigoi itsensä
  // tätä kautta "tilaukseen". Tämän avulla saamme sen kuitenkin sulkeutumaan.
  closeCart(): void {
    this.basketToProceedSession = false;
    setTimeout(() => this.basketToProceedSession = true, 50);
  }


  // Laskee ostoskorissa olevien tuotteiden yhteishinnan / yhteismäärän
  calcPrice(products: ProductCart[]): number {
    return this.productCartService.calcPrice(products);
  } countProducts(products: ProductCart[]): number {
    return this.productCartService.countProducts(products);
  }


  // Hakulauseessa olevan Subject-olion käytänne, jossa uusi hakusana tuotteille
  // tulee vanhan hakusanan tilalle
  search(term: string): void {
    this.searchTerms.next(term);
  }


  /*
   HAKEE TUOTEKORIN
    Funktio, joka hakee tuotekorin, tilaamalla ProducCartServicen Observablen.
    Joka kerta kun tuotekoriin lisätään jotain, päivittyy siitä tieto
    automaattisesti myös tähän funktioon. Varmistuskeinona tieto voidaan myös
    hakea SessionStoragesta.
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
    Funktio, joka hakee tiedon käyttäjän kirjautumisesta tilaamalla AuthServicen
    Observablen. Joka kerta kun käyttäjä kirjautuu sisään tai ulos, tämä
    funktio saa uuden arvon. Varmistuskeinona tieto voidaan myös hakea
    SessionStoragesta.
  */
  checkLoginState(): void {
    this.authService.returnLoginCond()
    .subscribe(cond => this.login = cond);
    if (!this.login && sessionStorage.getItem('credentials')) {
      const sessvalues = JSON.parse(sessionStorage.getItem('credentials'));
      this.login = sessvalues.name;
    }
  }


  /*
   HAKEE TIEDON ONKO KÄYTTÄJÄ ADMIN
    Funktio, joka hakee tiedon adminin kirjautumisesta tilaamalla AuthServicen
    Observablen. Joka kerta kun ADMIN-käyttäjä kirjautuu sisään tai ulos, tämä
    funktio saa uuden arvon. Varmistuskeinona tieto voidaan myös hakea
    AuthServicen funktiosta, joka tarkastaan tokenin.
  */
  checkAdminState(): void {
    this.authService.returnAdminCond()
      .subscribe(cond => this.admin = cond);
    if (!this.admin && this.authService.isAdminAuthenticated()) {
      this.admin = true;
    }
  }


  /*
   HAKEE KAIKKI TUOTELAJIT
    Funktio, joka hakee komponentin luonnin aikana kaikki tuotetyypit servicen
    avulla. Jos tuotelajien haussa tulee virhe, console.logataan virhe.
  */
  getProductTypes(): void {
    this.productService.getProductTypes()
    .subscribe(type => this.productTypes = type),
    err => console.error(err);
  }


  /*
   POISTAA TUOTTEEN OSTOSKORISTA
    Toimii väli-funktiona asiakaspuolen ja servicen välillä. Kun käyttäjä
    klikkaa tuotekorin tuotteen-poistoa. Tämä ohjaa kutsun ProducCartServiceen.
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
   KIRJAA KÄYTTÄJÄN ULOS
    Kun käyttäjä painaa 'Kirjaudu ulos' -nappia tämä funktio laittaa aluksi
    paikallisen muuttujan tyhjäksi. Sen jälkeen se kutsuu AuthServicin omaa
    uloskirjautumis-funktiota. Lopuksi poistetaan SessionStoragesta
    'credentials' -autentikaatioarvo. Näin saadaan valmis uloskirjautuminen.
  */
  logout() {
    this.login = null;
    this.authService.logOut();
    sessionStorage.removeItem('credentials');
  }
}
