import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';

import { Product } from '../../dataclasses/Product';
import { User } from '../../dataclasses/User';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public page = 'prod';

  public fProduct = new Product();

  private temporarySafeName: string;

  // Kertoo komponentille ollaanko tekemässä uutta
  // tiedostoa vai muokkaamassa jo olemassa olevaa
  public newProduct = true;


  // Tuotelajit | Tuotteet | Käyttäjät
  public productTypes: any[];
  public products: Product[];
  public users: User[];

  // Kuva tuotteelle | Valitun kuvan nimi
  public imgfile: File;
  public imgSelected: string;

  // Kuvien root-osoite
  public imageurl = 'http://localhost:3000/images/';

  // Tuotteen lisäys onnistui/epäonnistui
  public productSuccess: string;
  public productFailed: string;


  constructor (
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.getProductTypes();
    this.getAllProducts();
    this.getAllUsers();
  }

  // Muuttaa käyttäjän antaman tekstikappaleen URL-turvalliseksi tekstiksi
  convert(name: string): string {
    if (name) {
      name = name.toLowerCase();
      name = name.replace(/\s/g, '-');
      name = name.replace(/[|&;$%@"<>()+,]/g, '');
      name = name.replace(/[ä]/g, 'a');
      name = name.replace(/[ö]/g, 'o');
      name = name.replace(/[å]/g, 'a');
      this.temporarySafeName = name;
      return this.temporarySafeName;
    } else return '';
  }

  // Vaihtaa sivua samassa komponentissa käyttäjän ja tuotteen välillä
  changePage(): void {
    this.page = this.page === 'prod' ? 'user' : 'prod';
  }

  // Vaihto uuden tuotteen ja päivitettävän tuotteen välillä
  changeProductAttribute(): void {
    this.newProduct = this.newProduct ? false : true;
  }

  /*
    JO OLEMASSA OLEVAN TUOTTEEN MUOKKAUS
    Tuo päivitettävän tuotteen tiedot parametrina funktioon. Funktio
    siirtää tiedot asiakasnäkymän lomakkeeseen päivitystä varten.
  */
  updateProd(p: Product): void {
    // Siirrä käyttäjä muokkauspalkkiin
    const scrollToTop = window.setInterval(() => {
      const pos = window.pageYOffset;
        if (pos > 0) {
          window.scrollTo(0, pos - 20);
        } else {
          window.clearInterval(scrollToTop);
        }
    }, 6);
    this.newProduct = false;
    // Päivitettävän tuotteen tiedot two-way-binding muuttujaan, joka
    // keskustelee lomakkeen kanssa
    this.fProduct = p;
    this.fProduct.bpoint0 = p.bulletpoints[0];
    this.fProduct.bpoint1 = p.bulletpoints[1];
    this.fProduct.bpoint2 = p.bulletpoints[2];
    this.fProduct.bpoint3 = p.bulletpoints[3];
  }


  // Kun kuva valitaan, viedään se muuttujaan. Samalla tieto lähtee toiseen
  // muuttujaan, joka tulostaa käyttäjälle valitun kuvan nimen
  onfileSelected(event): void {
    this.imgfile = event.target.files[0];
    if (this.imgfile) this.imgSelected = event.target.files[0].name;
  }

  /*
    KAIKKIEN TUOTTEIDEN HAKU
  */
  getAllProducts(): void {
    this.productService.getProducts()
      .subscribe(products => this.products = products),
        err => console.error('Tuotteita ei voitu hakea' + err);
  }

  /*
    KAIKKIEN TUOTELAJIEN HAKU
  */
  getProductTypes(): void {
    this.productService.getProductTypes()
      .subscribe(types => this.productTypes = types),
        err => console.error('Tuotelajeja ei voitu hakea: ' + err);
  }

  /*
    KAIKKIEN KÄYTTÄJIEN HAKU
  */
  getAllUsers(): void {
    this.userService.getAllUsers()
      .subscribe(users => this.users = users),
        err => console.error(err);
  }


  /*
    UUDEN TUOTTEEN LUOMINEN / VANHAN PÄIVITTÄMINEN
  */
  productHandler(pForm: NgForm) {

    // Haetaan muuttujasta type -arvolle sen mukainen safetype -arvo
    const type = this.productTypes.find(obj => obj.type === this.fProduct.type);
    this.fProduct.safetype = type.safetype;
    this.fProduct.safename = this.temporarySafeName;

    // UUSI TUOTE
    if (this.newProduct) {
      this.productService.createProduct(this.fProduct)
        .subscribe(res => {
          // Jos tietokantaan lisäys onnistuu, kokeillaan lisätä kuva
          // palvelinpuolelle
          this.productService.addImageToProduct(this.imgfile, res.img)
            .subscribe(() => {
              pForm.reset();
              this.productSuccess = 'Tuotteen lisäys onnistui';
              this.getAllProducts();
              this.imgSelected = '';
              setTimeout(() => this.productSuccess = '', 2000);
            // Virhe kuvaa lisätessä
            }), err => {
              console.error(err);
              this.productFailed = 'Tuotteen lisäys onnistui, mutta kuvaa ei \
              saatu lisättyä. Lisää kuva manuaalisesti';
              setTimeout(() => this.productFailed = '', 5000);
            };
        // Virhe tuotteen luonnin yhteydessä
        }, err => {
            console.error(err);
            this.productFailed = err.error;
            setTimeout(() => this.productFailed = '', 2000);
        });

    // VANHA TUOTE
    } else {
      this.productService.updateProduct(this.fProduct)
        .subscribe(() => {
          this.productSuccess = 'Tuotteen päivitys onnistui';
          setTimeout(() => this.productSuccess = '', 4000);
          pForm.reset();
          this.changeProductAttribute();
          this.getAllProducts();
        }), err => {
          this.productFailed = err;
          setTimeout(() => this.productFailed = '', 4000);
        };
     }
  }


  /*
    POISTA TUOTE
  */
  deleteProd(ean: string, img: string): void {
     this.productService.deleteProduct(ean, img)
      .subscribe(() => {
        this.getAllProducts();
        console.log('Tuotteen: ' + ean + ' poisto onnistui');
      }, err => {
        console.error(err);
      });
  }


}
