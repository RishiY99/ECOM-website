import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { order } from '../../services/types';
import { ProductServies } from '../../services/product-servies';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnDestroy {

  cartitmes: order[] | undefined
  private destroy$ = new Subject<void>();

  constructor(private product: ProductServies, private crf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getoffers()
    this.crf.detectChanges()
  }

  deleteorder(id: string) {
    this.product.deletinprocesorder(id).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res) {
        this.getoffers()
      }
    })
  }

  getoffers() {
    this.product.getorders().pipe(takeUntil(this.destroy$)).subscribe((res: order[] | undefined) => {
      if (res) {
        this.cartitmes = res
        this.crf.detectChanges()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
