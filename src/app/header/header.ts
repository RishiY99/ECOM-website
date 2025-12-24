import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';
import { UserServices } from '../../services/user-services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  menuType: string = "";
  sellerName: string = "";
  searchresult: undefined | product[];
  username: string = "";
  cartItems: number = 0;

  searchError: string = '';

  private destroy$ = new Subject<void>();

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private product: ProductServies
    , private crf: ChangeDetectorRef, private userauth: UserServices) { }

  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((val: any) => {
        if (val.url) {
          if (isPlatformBrowser(this.platformId)) {
            if (localStorage.getItem("sellerData") && val.url.includes("seller")) {

              this.menuType = "seller"
              if (localStorage.getItem("sellerData")) {
                let sellerstore = localStorage.getItem("sellerData")
                let sellerData = sellerstore && JSON.parse(sellerstore)
                this.sellerName = sellerData.name;
              }
            } else if (localStorage.getItem("user")) {
              let userstore = localStorage.getItem("user")
              let userdata = userstore && JSON.parse(userstore)
              this.username = userdata.name;
              this.menuType = "user"
              this.product.getcartlist(userdata.id)
            }
            else {
              this.menuType = "default"
            }
          }
        }
      });

    this.userauth.userauth()

    let itemsincart = localStorage.getItem("cart")
    if (itemsincart) {
      this.cartItems = JSON.parse(itemsincart).length
    }

    this.product.carddata
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((items) => {
        this.cartItems = items.length;
      });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("sellerData");
      this.product.carddata.emit([])
    }
    this.router.navigate([""])
  }

  searchProduct(query: KeyboardEvent) {
    if (query) {
      const element = query.target as HTMLInputElement;

      this.searchError = '';

      this.product.serachProducts(element.value).subscribe({
        next: (res) => {
          if (res.length > 2) {
            res.length = 2;
          }

          this.searchresult = res;

          this.crf.detectChanges();
        },

        error: (error) => {
          this.searchError = 'Search failed. Please try again.';

          this.searchresult = [];

          this.crf.detectChanges();
        }
      });
    }
  }

  signout() {
    localStorage.removeItem("user")
    this.router.navigate(['/'])
  }

  hidesearch() {
    this.searchresult = undefined;
  }

  submitsearch(query: string) {
    this.router.navigate([`search/${query}`])
  }

  redirectTo(id: string) {
    this.router.navigate([`details/${id}`])
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }
}
