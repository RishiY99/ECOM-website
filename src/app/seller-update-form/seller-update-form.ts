import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';

@Component({
  selector: 'app-seller-update-form',
  imports: [FormsModule],
  templateUrl: './seller-update-form.html',
  styleUrl: './seller-update-form.css',
})
export class SellerUpdateForm {
  Productdata: undefined | product

  changeconfirmation: undefined | string

  constructor(private route: ActivatedRoute, private product: ProductServies, private cdr: ChangeDetectorRef, private router: Router) { }


  ngOnInit(): void {
    let productId = this.route.snapshot.paramMap.get('id');
    console.warn(productId)
    productId && this.product.productupdate(productId).subscribe((res) => {
      console.warn(res)
      this.Productdata = res
      this.cdr.detectChanges()
    })

  }

  submit(product: product) {
    if (this.Productdata) {
      product.id = this.Productdata.id
    }

    this.product.changedetected(product).subscribe((res) => {
      console.warn(res)
      if (res) {
        this.changeconfirmation = "Product Updated"
      }

      this.cdr.detectChanges()
    });

    this.changeconfirmation = undefined,
      this.router.navigate(['/seller-home'])

  }

}
