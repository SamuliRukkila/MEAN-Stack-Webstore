import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { ProductCartService } from '../../services/product-cart.service';

import { Product } from '../../dataclasses/Product';
import { ProductCart } from '../../dataclasses/ProductCart';

@Component({
  selector: 'app-product-types',
  templateUrl: './product-types.component.html',
  styleUrls: ['./product-types.component.scss']
})
export class ProductTypesComponent implements OnInit {

  // Käytetään subscribe-metodia tässä komponentissa eri tuotelajien kohdalla,
  // jotta siirtyminen toiseen sivuun samassa komponentissa on mahdollista
  productSubscription: Subscription;

  // Root-osoite kuville
  public imageurl = 'http://localhost:3000/images/';
  // Tuotteiden tiedot
  public products: Product[];


  constructor (
    private productService: ProductService,
    private productCartService: ProductCartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.handleSubscription();
  }

  // Hoitaa komponentin tilauksen => ottaa vastaan sivun urlin parametrin,
  // jotta sivun vaihtaminen samassa komponentissa on mahdollista
  handleSubscription(): void {
    this.productSubscription = this.route.params.subscribe(
      (params: Params) => this.getProducts(params.safetype)
    );
  }

  /*
    LISÄÄ TUOTTEEN OSTOSKORIIN
  */
  addToCart(product: ProductCart) {
    this.productCartService.addToProductCart(product);
  }

  /*
    HAETAAN TUOTTEET TUOTELAJIN MUKAAN
    Haetaan osoitteen parametrin mukana tullut avainsana, joka tuodaan mukaan
    hakuun,jossa etsitään tietyn tuotelajin mukaisia tuotteita.
  */
  getProducts(param: string): void {
    this.productService.getProductsByType(param)
        .subscribe(product => this.products = product
        , () => this.router.navigate(['/etusivu'])
    );
  }

}
