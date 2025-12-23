// ============================================================================
// IMPORTS
// ============================================================================
import { HttpClient } from '@angular/common/http';
// HttpClient: Angular's service for making HTTP requests (GET, POST, PUT, DELETE)

import { EventEmitter, Injectable } from '@angular/core';
// EventEmitter: Used for cross-component communication (emitting cart updates)
// Injectable: Decorator that makes this class available for dependency injection

import { cart, order, product } from './types';
// Import our custom TypeScript interfaces for type safety

// ============================================================================
// NEW IMPORTS FOR ERROR HANDLING
// ============================================================================
import { ErrorHandlerService } from './error-handler.service';
// Our custom error handler service for centralized error handling

import { Observable, throwError, of } from 'rxjs';
// Observable: Represents a stream of data over time (like HTTP responses)
// throwError: Creates an Observable that immediately errors (for re-throwing errors)
// of: Creates an Observable that emits a single value (for fallback data)

import { catchError, retry, tap } from 'rxjs/operators';
// catchError: Catches errors in the Observable stream and handles them
// retry: Automatically retries failed HTTP requests (useful for network issues)
// tap: Performs side effects (like logging) without modifying the data stream

// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class ProductServies {

  carddata = new EventEmitter<product[] | []>()

  // ============================================================================
  // CONSTRUCTOR - Inject Dependencies
  // ============================================================================
  constructor(
    private http: HttpClient,
    // Inject HttpClient for making API calls

    private errorHandler: ErrorHandlerService
    // Inject our error handler service for centralized error handling
  ) { }
  // ============================================================================
  // ADD PRODUCT (Seller)
  // ============================================================================
  // This method adds a new product to the database
  // Returns: Observable<product> - The created product
  // ============================================================================
  SellerAddProduct(data: product): Observable<any> {
    return this.http.post('http://localhost:3000/products', data)
      .pipe(
        // ======================================================================
        // PIPE: Chain multiple RxJS operators
        // ======================================================================
        // pipe() allows us to chain operators that transform/handle the data
        // Think of it like a pipeline: data flows through each operator
        // ======================================================================

        tap((response) => {
          // ==================================================================
          // TAP: Perform side effects without modifying data
          // ==================================================================
          // tap() is like a "peek" into the data stream
          // We can log, update UI, etc. but we don't change the data
          // The data continues to the next operator unchanged
          // ==================================================================
          console.log('✅ Product added successfully:', response);
          // Log success for debugging
        }),

        catchError((error) => {
          // ==================================================================
          // CATCHERROR: Handle errors in the Observable stream
          // ==================================================================
          // If the HTTP request fails, this operator catches the error
          // We can:
          // 1. Log the error
          // 2. Show user-friendly message
          // 3. Return fallback data OR re-throw the error
          // ==================================================================

          // Use our error handler service to get user-friendly message
          const errorMessage = this.errorHandler.handleError(error);

          // Log the error with context for debugging
          this.errorHandler.logError(error, 'ProductService.SellerAddProduct');

          // Re-throw the error so the component can handle it
          // throwError creates a new Observable that immediately errors
          return throwError(() => new Error(errorMessage));
          // The () => syntax is a function that returns the error
          // This is the modern RxJS 7+ syntax
        })
      );
  }

  // ============================================================================
  // GET ALL PRODUCTS
  // ============================================================================
  // Fetches all products from the database
  // Returns: Observable<product[]> - Array of all products
  // ============================================================================
  productList(): Observable<product[]> {
    return this.http.get<product[]>('http://localhost:3000/products')
      .pipe(
        // ======================================================================
        // RETRY: Automatically retry failed requests
        // ======================================================================
        // retry(2) means: if the request fails, try again up to 2 more times
        // This is useful for temporary network issues
        // Total attempts = 1 (original) + 2 (retries) = 3 attempts
        // ======================================================================
        retry(2),
        // If it fails 3 times, then move to catchError

        tap((products) => {
          console.log(`✅ Fetched ${products.length} products`);
          // Log how many products were fetched
        }),

        catchError((error) => {
          const errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'ProductService.productList');

          // ================================================================
          // OPTION 1: Return empty array as fallback
          // ================================================================
          // Instead of throwing error, we return empty array
          // This prevents the app from breaking if products can't load
          // The UI will just show "No products available"
          // ================================================================
          console.warn('⚠️ Returning empty product list due to error');
          return of([]);
          // of([]) creates an Observable that emits an empty array

          // ================================================================
          // OPTION 2: Re-throw error (commented out)
          // ================================================================
          // If you want components to handle the error:
          // return throwError(() => new Error(errorMessage));
          // ================================================================
        })
      );
  }

  deleteitem(id: string) {
    return this.http.delete(`http://localhost:3000/products/${id}`)
  }

  productupdate(id: string) {
    return this.http.get<product>(`http://localhost:3000/products/${id}`)
  }

  changedetected(data: product) {
    return this.http.put<product>(`http://localhost:3000/products/${data.id}`, data)
  }
  popularproduct() {
    return this.http.get<product[]>(`http://localhost:3000/products?_limit=3`)
  }

  trendyProducts() {
    return this.http.get<product[]>(`http://localhost:3000/products?_limit=8`)
  }

  // ============================================================================
  // SEARCH PRODUCTS
  // ============================================================================
  // Searches for products matching the query string
  // Parameters: query - The search term
  // Returns: Observable<product[]> - Array of matching products
  // ============================================================================
  serachProducts(query: string): Observable<product[]> {
    return this.http.get<product[]>(`http://localhost:3000/products?q=${query}`)
      .pipe(
        retry(1),
        // Only retry once for search (faster failure for better UX)

        tap((results) => {
          console.log(`🔍 Search "${query}" found ${results.length} results`);
        }),

        catchError((error) => {
          const errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'ProductService.serachProducts');

          // For search, return empty array if it fails
          // User will see "No results found" instead of error
          console.warn(`⚠️ Search failed for "${query}", returning empty results`);
          return of([]);
        })
      );
  }

  localaddtoCart(data: product) {
    let cart = []
    let cartdata = localStorage.getItem("cart")
    if (!cartdata) {
      localStorage.setItem("cart", JSON.stringify([data]))
      this.carddata.emit([data])
    } else {
      cart = JSON.parse(cartdata)
      cart.push(data)
      localStorage.setItem("cart", JSON.stringify(cart))

    }
    this.carddata.emit(cart)
  }

  removecartitem(id: string) {
    let cart = localStorage.getItem("cart")
    if (cart) {
      let cartitem = JSON.parse(cart)
      cartitem = cartitem.filter((item: product) => item.id !== id)
      if (cartitem) {
        localStorage.setItem("cart", JSON.stringify(cartitem))
        this.carddata.emit(cartitem)
      }
    }
  }

  signupcart(data: cart) {
    return this.http.post('http://localhost:3000/cart', data)
  }


  getcartlist(userid: string) {
    return this.http.get<product[]>(`http://localhost:3000/cart?user_id=${userid}`,
      { 'observe': 'response' }).subscribe((res) => {
        if (res && res.body) {
          this.carddata.emit(res.body)
        }
      })
  }


  removefromcart(id: string) {
    return this.http.delete(`http://localhost:3000/cart/${id}`)
  }

  cartlist() {
    let user = localStorage.getItem("user")
    let user_id = user && JSON.parse(user).id
    return this.http.get<cart[]>(`http://localhost:3000/cart?user_id=${user_id}`)
  }

  orders(data: order) {
    return this.http.post(`http://localhost:3000/orders`, data)
  }

  getorders() {
    let user = localStorage.getItem("user")
    let user_id = user && JSON.parse(user).id
    return this.http.get<order[]>(`http://localhost:3000/orders?user_id=${user_id}`)
  }


  deleteorder(id: string) {
    return this.http.delete(`http://localhost:3000/cart/${id}`, { observe: 'response' }).subscribe((res) => {
      if (res) {
        this.carddata.emit([])
      }
    })
  }


  deletinprocesorder(id: string) {
    return this.http.delete(`http://localhost:3000/orders/${id}`)
  }
}
