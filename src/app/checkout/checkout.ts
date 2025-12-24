import { ChangeDetectorRef, Component, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductServies } from '../../services/product-servies';
import { cart, priceSummary } from '../../services/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {

  cartitmes: WritableSignal<cart[]> = signal<cart[]>([]);

  price: WritableSignal<number> = signal<number>(0);

  message: WritableSignal<string> = signal<string>('');

  formattedPrice = computed(() => {
    const priceValue = this.price();
    return `₹${priceValue.toFixed(2)}`;
  });

  checkoutForm!: FormGroup;

  constructor(
    private product: ProductServies,
    private crf: ChangeDetectorRef,
    private route: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', Validators.required],

      address: ['', Validators.required]
    });

    this.product.cartlist().subscribe((res) => {
      this.cartitmes.set(res);

      let price = 0

      res.forEach((item: cart) => {
        price = price + (+item.price * item.quantity)
      });

      this.price.set(price);
    })
  }

  placeOrder() {
    let user = localStorage.getItem('user')

    let user_id = user && JSON.parse(user).id

    const currentPrice = this.price();

    if (currentPrice > 0) {
      let product = {
        ...this.checkoutForm.value,
        user_id,
        total: currentPrice
      }

      const items = this.cartitmes();

      items.forEach((item) => {
        setTimeout(() => {
          if (item.id) {
            this.product.deleteorder(item.id)
          }
        }, 2000);
      })

      this.product.orders(product).subscribe((res) => {
        if (res) {
          setTimeout(() => {
            this.message.set("order placed successfully");
          }, 2000);

          this.message.set("");

          this.route.navigate(['/myorders'])
        }
      })
    }
  }
}
