import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';
import { UserServices } from '../../services/user-services';

// ============================================================================
// NEW IMPORTS FOR UNSUBSCRIBE PATTERN
// ============================================================================
import { Subject } from 'rxjs';
// Subject: A special type of Observable that can emit values
// We use it as a "signal" to tell subscriptions to unsubscribe

import { takeUntil } from 'rxjs/operators';
// takeUntil: RxJS operator that automatically unsubscribes
// It listens to a Subject and unsubscribes when that Subject emits

import { OnDestroy } from '@angular/core';
// OnDestroy: Lifecycle hook interface
// Ensures we implement ngOnDestroy method for cleanup
// ============================================================================

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  // ============================================================================
  // IMPLEMENTING OnDestroy INTERFACE
  // ============================================================================
  // By implementing OnDestroy, we MUST create ngOnDestroy() method
  // TypeScript will give error if we forget to implement it
  // This ensures we always clean up subscriptions
  // ============================================================================
  menuType: string = "";
  sellerName: string = "";
  searchresult: undefined | product[];
  username: string = "";
  cartItems: number = 0;

  // ============================================================================
  // ERROR STATE MANAGEMENT
  // ============================================================================
  // Track error state for search functionality
  // This allows us to show error messages in the UI
  // ============================================================================
  searchError: string = '';
  // Stores the error message to display to users
  // Empty string means no error

  // ============================================================================
  // UNSUBSCRIBE PATTERN - DESTROY$ SUBJECT
  // ============================================================================
  // This is the KEY to preventing memory leaks!
  // ============================================================================
  private destroy$ = new Subject<void>();
  // ============================================================================
  // WHAT IS destroy$?
  // ============================================================================
  // - It's a Subject that acts as a "kill switch" for subscriptions
  // - When we call destroy$.next(), ALL subscriptions using takeUntil(destroy$)
  //   will automatically unsubscribe
  // - void type means it doesn't emit any value, just a signal
  // - private: Only this component can access it
  // - $ suffix: Convention to indicate it's an Observable/Subject
  // ============================================================================
  // 
  // WHY DO WE NEED THIS?
  // ============================================================================
  // Problem: When you subscribe to an Observable, it keeps running even after
  //          the component is destroyed. This causes MEMORY LEAKS!
  // 
  // Example WITHOUT unsubscribe:
  // ngOnInit() {
  //   this.router.events.subscribe(...) // ❌ Keeps running forever!
  // }
  // 
  // What happens:
  // 1. User navigates to page → Component created → Subscription starts
  // 2. User navigates away → Component destroyed → Subscription STILL RUNNING!
  // 3. User navigates back → New component → New subscription
  // 4. Now you have 2 subscriptions running!
  // 5. Navigate 10 times → 10 subscriptions → MEMORY LEAK!
  // 
  // Solution WITH destroy$:
  // ngOnInit() {
  //   this.router.events.pipe(
  //     takeUntil(this.destroy$)  // ✅ Auto-unsubscribes when destroy$ emits
  //   ).subscribe(...)
  // }
  // 
  // ngOnDestroy() {
  //   this.destroy$.next();  // Trigger unsubscribe for ALL subscriptions
  // }
  // ============================================================================

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private product: ProductServies
    , private crf: ChangeDetectorRef, private userauth: UserServices) { }


  ngOnInit(): void {
    // ==========================================================================
    // SUBSCRIPTION 1: Router Events (WITH takeUntil)
    // ==========================================================================
    // This subscription listens to route changes to update the menu type
    // WITHOUT takeUntil: This would keep running even after component is destroyed
    // WITH takeUntil: Automatically unsubscribes when destroy$ emits
    // ==========================================================================
    this.router.events
      .pipe(
        // ======================================================================
        // TAKEUNTIL OPERATOR - THE MAGIC!
        // ======================================================================
        // takeUntil(this.destroy$) means:
        // "Keep this subscription alive UNTIL destroy$ emits a value"
        // 
        // How it works:
        // 1. Subscription starts when component is created
        // 2. Subscription keeps running and listening to router events
        // 3. When component is destroyed, ngOnDestroy() is called
        // 4. ngOnDestroy() calls destroy$.next()
        // 5. destroy$ emits a value
        // 6. takeUntil sees the emission and AUTOMATICALLY UNSUBSCRIBES
        // 7. No more memory leak!
        // ======================================================================
        takeUntil(this.destroy$)
        // This ONE line prevents memory leaks!
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
    // Note the semicolon! Subscription is complete.

    this.userauth.userauth()


    let itemsincart = localStorage.getItem("cart")
    if (itemsincart) {
      this.cartItems = JSON.parse(itemsincart).length
    }

    // ==========================================================================
    // SUBSCRIPTION 2: Cart Data (WITH takeUntil)
    // ==========================================================================
    // This subscription listens to cart updates from the product service
    // Again, we use takeUntil to prevent memory leaks
    // ==========================================================================
    this.product.carddata
      .pipe(
        takeUntil(this.destroy$)
        // Same pattern: automatically unsubscribe when component is destroyed
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
  // ============================================================================
  // SEARCH PRODUCTS
  // ============================================================================
  // Called when user types in the search box
  // Shows live search results as user types
  // ============================================================================
  searchProduct(query: KeyboardEvent) {
    if (query) {
      const element = query.target as HTMLInputElement;

      // ========================================================================
      // CLEAR PREVIOUS ERROR
      // ========================================================================
      // Reset error state before new search
      // This ensures old errors don't persist
      // ========================================================================
      this.searchError = '';

      // ========================================================================
      // CALL SERVICE WITH ERROR HANDLING
      // ========================================================================
      // The service already has error handling with catchError
      // So if it fails, it returns empty array instead of throwing error
      // This means our subscribe will always succeed (with empty array on error)
      // ========================================================================
      this.product.serachProducts(element.value).subscribe({
        // ======================================================================
        // SUCCESS HANDLER
        // ======================================================================
        // This runs when the search completes successfully
        // (Even if it returns empty array due to error, it's still "success")
        // ======================================================================
        next: (res) => {
          // Limit results to 2 for better UI
          if (res.length > 2) {
            res.length = 2;
            // This modifies the array in-place to only keep first 2 items
          }

          this.searchresult = res;
          // Update the search results to display in dropdown

          this.crf.detectChanges();
          // Manually trigger change detection to update UI
          // (Needed because we're in an event handler)
        },

        // ======================================================================
        // ERROR HANDLER (Optional - for demonstration)
        // ======================================================================
        // This would only run if the service threw an error
        // But our service returns empty array instead, so this rarely runs
        // Still good to have as a safety net
        // ======================================================================
        error: (error) => {
          console.error('Search error in component:', error);
          // Log error for debugging

          this.searchError = 'Search failed. Please try again.';
          // Set error message to display in UI

          this.searchresult = [];
          // Clear search results

          this.crf.detectChanges();
          // Update UI to show error message
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
    console.warn(id);
    this.router.navigate([`details/${id}`])
  }

  // ============================================================================
  // NGONDESTROY - CLEANUP METHOD
  // ============================================================================
  // This is THE MOST IMPORTANT method for preventing memory leaks!
  // Angular calls this automatically when the component is destroyed
  // ============================================================================
  ngOnDestroy(): void {
    // ==========================================================================
    // TRIGGER UNSUBSCRIPTION
    // ==========================================================================
    // This ONE line unsubscribes ALL subscriptions that use takeUntil(destroy$)
    // ==========================================================================
    this.destroy$.next();
    // ========================================================================
    // WHAT HAPPENS WHEN WE CALL destroy$.next()?\n    // ========================================================================
    // 1. destroy$ Subject emits a value (void, so no actual value)
    // 2. ALL subscriptions with takeUntil(this.destroy$) receive this emission
    // 3. takeUntil operator sees the emission and automatically unsubscribes
    // 4. All subscriptions are now cleaned up!
    // 5. No memory leaks!
    // ========================================================================

    this.destroy$.complete();
    // ========================================================================
    // COMPLETE THE SUBJECT
    // ========================================================================
    // complete() tells the Subject "no more values will be emitted"
    // This is good practice to:
    // - Free up memory used by the Subject itself
    // - Prevent accidental emissions after component is destroyed
    // - Signal that the Subject's lifecycle is complete
    // ========================================================================

    console.log('🧹 Header component destroyed - all subscriptions cleaned up!');
    // Log for debugging - helps verify cleanup is happening
  }
  // ============================================================================
  // UNSUBSCRIBE PATTERN SUMMARY
  // ============================================================================
  // 
  // STEP 1: Create destroy$ Subject
  //   private destroy$ = new Subject<void>();
  // 
  // STEP 2: Add takeUntil to ALL subscriptions
  //   this.someObservable$.pipe(
  //     takeUntil(this.destroy$)
  //   ).subscribe(...)
  // 
  // STEP 3: Implement ngOnDestroy
  //   ngOnDestroy() {
  //     this.destroy$.next();
  //     this.destroy$.complete();
  //   }
  // 
  // That's it! All subscriptions automatically clean up when component destroys
  // 
  // ============================================================================
  // 
  // BENEFITS:
  // ✅ Prevents memory leaks
  // ✅ One pattern for all subscriptions
  // ✅ Automatic cleanup
  // ✅ No need to track individual subscriptions
  // ✅ Clean and maintainable code
  // 
  // ============================================================================

}
