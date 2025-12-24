import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { cart, order, product } from './types';
import { ErrorHandlerService } from './error-handler.service';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductServies {

  carddata = new EventEmitter<product[] | []>()

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  SellerAddProduct(data: product): Observable<any> {
    return this.http.post('http://localhost:3000/products', data)
      .pipe(
        tap((response) => {
        }),

        catchError((error) => {
          const errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'ProductService.SellerAddProduct');
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  productList(): Observable<product[]> {
    return this.http.get<product[]>('http://localhost:3000/products')
      .pipe(
        retry(2),

        tap((products) => {
        }),

        catchError((error) => {
          const errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'ProductService.productList');
          return of([]);
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

  serachProducts(query: string): Observable<product[]> {
    return this.http.get<product[]>(`http://localhost:3000/products?q=${query}`)
      .pipe(
        retry(1),

        tap((results) => {
        }),

        catchError((error) => {
          const errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'ProductService.serachProducts');
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
