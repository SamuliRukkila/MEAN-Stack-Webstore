import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

import { ProductService } from '../../services/product.service';
import { ProductCartService } from '../../services/product-cart.service';

import { Product } from '../../dataclasses/Product';
import { ProductCart } from '../../dataclasses/ProductCart';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})
export class FrontpageComponent implements OnInit {

  // Root-url kuville
  public imageurl = environment.imageurl;
  // Kaikki tuotteet
  public products: Product[];

  constructor (
    private productService: ProductService,
    private productCartService: ProductCartService
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }


  /*
   KAIKKIEN TUOTTEIDEN HAKU
    Hakee kaikki tuotteet, mutta leikkaa osan niistä pois, jotta käyttäjälle
    näytetään vain 12 tuotetta etusivulla. (3 X 4 GRID)
  */
  getProducts(): void {
    this.productService.getProducts()
    .subscribe(product => this.products = product.slice(0, 12));
  }


  /*
   TUOTTEEN LISÄÄMINEN OSTOSKORIIN
    Kun käyttäjä klikkaa "Lisää ostoskoriin" -nappia, tämä funktio vie tiedon
    siitä eteenpäin ProductCartServicelle.
  */
  addToCart(product: ProductCart) {
    this.productCartService.addToProductCart(product);
  }

}
