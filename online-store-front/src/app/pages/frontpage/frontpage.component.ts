import { Component, OnInit } from '@angular/core';

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
  public imageurl = 'http://localhost:3000/images/';
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
  */
  getProducts(): void {
    this.productService.getProducts()
    .subscribe(product => this.products = product.slice(0, 9));
  }

  /*
    TUOTTEEN LISÄÄMINEN OSTOSKORIIN
  */
  addToCart(product: ProductCart) {
    this.productCartService.addToProductCart(product);
  }

}
