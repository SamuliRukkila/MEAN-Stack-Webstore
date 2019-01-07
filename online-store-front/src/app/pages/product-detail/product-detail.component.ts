import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { ProductCartService } from '../../services/product-cart.service';


import { Product } from '../../dataclasses/Product';
import { ProductCart } from '../../dataclasses/ProductCart';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  // Käytetään subscribe-metodia tässä komponentissa eri tuotelajien kohdalla,
  // jotta siirtyminen toiseen sivuun samassa komponentissa on mahdollista
  productSubscription: Subscription;

  // Root-osoite kuville
  public imgurl = 'http://localhost:3000/images/';
  // Tuotteen tiedot
  public product: Product;


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
      (params: Params) => this.getProduct(params.safename)
    );
  }

  /*
    LISÄÄ TUOTTEEN OSTOSKORIIN
  */
  addToCart(product: ProductCart) {
    this.productCartService.addToProductCart(product);
  }


  /*
    HAETAAN TUOTTEEN TIEDOT
    Haetaan osoitteen parametrin mukana tullut avainsana, joka tuodaan mukaan
    hakuun, jossa etsitään sitä vastaava tuote. Onnistuneissa tilanteissa
    tuotteen info jaetaan koko sivulle
  */
  getProduct(param: string): void {
    this.productService.getProduct(param)
        .subscribe(product => this.product = product,
          () => this.router.navigate(['/etusivu'])
    );
  }

}
