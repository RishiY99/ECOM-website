import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductServies } from '../../services/product-servies';
import { cart, priceSummary } from '../../services/types';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-cart-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-list.html',
  styleUrl: './cart-list.css',
})
export class CartList {

  cartitmes: cart[] | undefined
  summary: priceSummary = {
    price: 0,
    tax: 0,
    delivery: 0,
    discount: 0,
    total: 0
  }
  constructor(private product: ProductServies, private crf: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.opeingfunction()
  }

  removeitems(id: string | undefined) {
    if (!id) return; // Guard clause: exit if id is undefined
    this.product.removefromcart(id).subscribe((res) => {
      if (res) {
        this.opeingfunction()
      }
    })
  }


  opeingfunction() {
    this.product.cartlist().subscribe((res) => {
      this.cartitmes = res
      this.crf.detectChanges()

      let price = 0
      res.forEach((item: cart) => {
        price = price + (+item.price * item.quantity)
      });
      this.summary.price = price;
      this.summary.delivery = 100;
      this.summary.tax = price / 10;
      this.summary.discount = price / 10;
      this.summary.total = price + this.summary.delivery + this.summary.tax - this.summary.discount


      this.crf.detectChanges()
      if (!this.cartitmes) {
        this.router.navigate(['/'])
      }
    })
  }

  tocheckOut() {
    this.router.navigate(['/checkout'])

  }
}
