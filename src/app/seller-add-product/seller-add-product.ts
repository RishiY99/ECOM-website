import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-add-product',
  imports: [FormsModule],
  templateUrl: './seller-add-product.html',
  styleUrl: './seller-add-product.css',
})
export class SellerAddProduct {
  addproductessge: string | undefined

  constructor(private product: ProductServies, private router: Router) {

  }

  submit(data: product) {
    this.product.SellerAddProduct(data).subscribe((data) => {
      if (data) {
        this.addproductessge = "Product added successfully"
      }

      this.router.navigate(['/seller-home'])
      setTimeout(() => {
        this.addproductessge = undefined
      }, 3000)
    })
  }
}
