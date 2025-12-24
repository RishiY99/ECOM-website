import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { product } from '../../services/types';
import { ProductServies } from '../../services/product-servies';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seller-home',
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './seller-home.html',
  styleUrl: './seller-home.css',
})
export class SellerHome implements OnInit {
  productList: undefined | product[]
  deletionconfirmation: string | undefined
  fatrash = faTrash
  pen = faPen

  constructor(private product: ProductServies, private cdr: ChangeDetectorRef) { }

  listitem() {
    this.product.productList().subscribe({
      next: (res: any) => {
        if (res) {
          this.productList = res;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      }
    });
  }

  ngOnInit(): void {
    this.listitem();
  }

  deleteProduct(id: string) {
    this.product.deleteitem(id).subscribe(() => {
      this.deletionconfirmation = 'Product deleted successfully';
      this.listitem();

      setTimeout(() => {
        this.deletionconfirmation = undefined;
      }, 3000);
    }
    );
  }
}
