import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductServies } from '../../services/product-servies';
import { cart, product } from '../../services/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnDestroy {

  productdetils: undefined | product
  productquantity: number = 1
  cartshow: boolean = true
  cartitemNumber: undefined | product
  private destroy$ = new Subject<void>();

  constructor(private activeroute: ActivatedRoute, private product: ProductServies, private crf: ChangeDetectorRef) { }

  ngOnInit(): void {
    let id = this.activeroute.snapshot.paramMap.get('id')
    id && this.product.productupdate(id).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.productdetils = res
      this.crf.detectChanges()
    })
    let items = localStorage.getItem("cart")
    if (items && id) {
      let cartitem = JSON.parse(items)
      cartitem = cartitem.filter((cartitem: product) => cartitem.id == id)
      if (cartitem.length) {
        this.cartshow = false
      } else {
        this.cartshow = true
      }
    }

    let user = localStorage.getItem("user")
    if (user) {
      let userid = JSON.parse(user).id;
      this.product.getcartlist(userid)
      this.product.carddata.pipe(takeUntil(this.destroy$)).subscribe((res) => {
        let cartitem = res.filter((item: product) => id === item.product_id)
        if (cartitem.length > 0) {
          this.cartitemNumber = cartitem[0]
          setTimeout(() => {
            this.cartshow = false
          }, 100)
        } else {
          setTimeout(() => {
            this.cartshow = true
          }, 100)
        }
      })
    }
  }

  handleQunatity(type: string) {
    if (type === "min" && this.productquantity > 1) {
      this.productquantity -= 1
    } else if (type === "max" && this.productquantity < 20) {
      this.productquantity += 1
    }
  }

  addtoCart() {
    if (this.productdetils) {
      this.productdetils.quantity = this.productquantity
      if (!localStorage.getItem("user")) {
        this.product.localaddtoCart(this.productdetils)
        this.cartshow = false
      } else {
        let user = localStorage.getItem("user")
        let user_id = user && JSON.parse(user).id
        let product_id = this.productdetils.id
        let data: cart = {
          ...this.productdetils,
          user_id,
          product_id
        }
        delete data.id
        this.product.signupcart(data).pipe(takeUntil(this.destroy$)).subscribe((res) => {
          if (res) {
            this.product.getcartlist(user_id);
            this.cartshow = false
          }
        })
      }
    }
  }

  removeCart(id: string) {
    let user = localStorage.getItem("user")
    let user_id = user && JSON.parse(user).id
    if (!user_id) {
      this.product.removecartitem(id)
      this.cartshow = true
    } else {
      this.cartitemNumber && this.product.removefromcart(this.cartitemNumber.id).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res) {
          this.product.getcartlist(user_id)
          this.cartshow = true
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
