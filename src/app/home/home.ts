import { ChangeDetectorRef, Component } from '@angular/core';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  popularProduct: undefined | product[]
  currentSlide: number = 0;
  trendyproduct: undefined | product[]

  constructor(private product: ProductServies, private crf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.product.popularproduct().subscribe((res: any) => {
      this.popularProduct = res;
      setInterval(() => {
        this.nextSlide()
      }, 2000)
    })
    this.product.trendyProducts().subscribe((res) => {
      this.trendyproduct = res;
      this.crf.detectChanges()
    });
  }

  nextSlide(): void {
    if (this.popularProduct) {
      this.currentSlide = (this.currentSlide + 1) % this.popularProduct.length;
      this.crf.detectChanges()
    }
  }

  previousSlide(): void {
    if (this.popularProduct) {
      this.currentSlide = this.currentSlide === 0
        ? this.popularProduct.length - 1
        : this.currentSlide - 1;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}
