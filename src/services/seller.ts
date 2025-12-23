import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import type { LoginData, SignUpData } from './types';

// Re-export types so they can be imported from this module
export type { LoginData, SignUpData };


@Injectable({
  providedIn: 'root',
})
export class Seller {
  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new Subject<string>();
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    // Check if seller is already logged in on service initialization
    this.checkSellerAuth();
  }
  private checkSellerAuth(): void {
    // Only check localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const sellerData = localStorage.getItem('sellerData');
      if (sellerData) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  userSignUp(data: SignUpData): any {
    return this.http.post('http://localhost:3000/seller', data);
  }
  userLogin(data: LoginData): any {
    console.warn(data);
    return this.http.get(`http://localhost:3000/seller?email=${data.email}&password=${data.password}`, { observe: 'response' });
  }


}
