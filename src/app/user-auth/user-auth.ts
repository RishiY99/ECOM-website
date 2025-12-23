import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cart, SignUpData, product } from '../../services/types';
import { UserServices } from '../../services/user-services';
import { CommonModule } from '@angular/common';
import { ProductServies } from '../../services/product-servies';

@Component({
  selector: 'app-user-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-auth.html',
  styleUrl: './user-auth.css',
})
export class UserAuth {
  userstate: boolean = true
  invaliduser: undefined | string
  constructor(private user: UserServices, private crf: ChangeDetectorRef, private product: ProductServies) { }


  usersignUp(value: SignUpData) {
    this.user.createuser(value)
  }
  openLogin() {
    this.userstate = true
  }

  opensignup() {
    this.userstate = false
  }


  userlogin(value: SignUpData) {
    this.user.userlogin(value)
    this.user.userlogininvalid.subscribe((res) => {
      if (res) {
        this.invaliduser = "Invalid user or password"
        this.crf.detectChanges()
      } else {
        this.localcarttoonlinecart()
      }
    })
  }


  localcarttoonlinecart() {
    let user = localStorage.getItem("user")
    let user_id = user && JSON.parse(user).id
    let cart = localStorage.getItem("cart")
    if (cart) {
      let cartdata = JSON.parse(cart)

      cartdata.forEach((product: product, index: number) => {
        let itemcart: cart = {
          ...product,
          user_id,
          product_id: product.id
        }
        delete itemcart.id;
        setTimeout(() => {
          this.product.signupcart(itemcart).subscribe(() => {
            console.warn("done")
          })
          if (cartdata.length === index + 1) {
            localStorage.removeItem("cart")
          }
        }, 500)
      });
    }
    setTimeout(() => {
      this.product.getcartlist(user_id)
    }, 2000)
  }
}


