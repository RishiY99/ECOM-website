import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Seller, SignUpData, LoginData } from '../../services/seller';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-auth',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './seller-auth.html',
  styleUrl: './seller-auth.css',
})
export class SellerAuth implements OnInit {
  showlogin: boolean = false;
  authError: string = '';
  signupform!: FormGroup;
  loginform!: FormGroup;

  constructor(
    private seller: Seller,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.seller.isLoginError.subscribe((error: string) => {
      setTimeout(() => {
        this.authError = error;
        this.cdr.detectChanges();
      }, 0);
    });
    this.signupform = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginform = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  signUp(): void {
    const data = this.signupform.value as SignUpData;

    this.seller.userSignUp(data).subscribe({
      next: (response: any) => {
        localStorage.setItem('sellerData', JSON.stringify(response));

        this.seller.isSellerLoggedIn.next(true);

        this.router.navigate(['/seller-home']);
      },
      error: (error: unknown) => {
        alert('Sign up failed. Please try again.');
      }
    });
  }

  login(): void {
    const data = this.loginform.value as LoginData;

    this.authError = '';

    this.seller.userLogin(data).subscribe({
      next: (response: any) => {
        if (response && response.body && response.body.length > 0) {
          localStorage.setItem('sellerData', JSON.stringify(response.body[0]));

          this.seller.isSellerLoggedIn.next(true);

          this.router.navigate(['/seller-home']);
        } else {
          this.seller.isLoginError.next('Invalid email or password. Please try again.');
        }
      },
      error: (error: unknown) => {
        this.seller.isLoginError.next('Login failed. Please check your connection and try again.');
        this.router.navigate(['/seller-auth']);
      }
    });
  }

  openLogin(): void {
    this.showlogin = true;
  }

  openSignUp(): void {
    this.showlogin = false;
  }
}
