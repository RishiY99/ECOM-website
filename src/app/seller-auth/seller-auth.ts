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
    // Subscribe to login error events from the seller service
    this.seller.isLoginError.subscribe((error: string) => {
      console.log('Error received in component:', error);
      setTimeout(() => {
        this.authError = error;
        console.log('authError set to:', this.authError);
        this.cdr.detectChanges(); // Manually trigger change detection
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

  // Sign up method - uses reactive form data and saves to local storage
  signUp(): void {
    // Get form data from the reactive form
    const data = this.signupform.value as SignUpData;
    console.log('Sign up data:', data);

    this.seller.userSignUp(data).subscribe({
      next: (response: any) => {
        console.log('Sign up successful:', response);

        // Save the response to local storage
        localStorage.setItem('sellerData', JSON.stringify(response));

        // Update the logged-in status
        this.seller.isSellerLoggedIn.next(true);

        // Navigate to seller home or dashboard
        this.router.navigate(['/seller-home']);
      },
      error: (error: unknown) => {
        console.error('Sign up error:', error);
        alert('Sign up failed. Please try again.');
      }
    });
  }

  // Login method - handles user authentication
  login(): void {
    const data = this.loginform.value as LoginData;

    console.log('Login data:', data);
    this.authError = ''; // Clear any previous errors

    this.seller.userLogin(data).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);

        // Check if response body has data (user found)
        if (response && response.body && response.body.length > 0) {
          console.log('Login successful:', response.body[0]);

          // Save the first user from the response to local storage
          localStorage.setItem('sellerData', JSON.stringify(response.body[0]));

          // Update the logged-in status
          this.seller.isSellerLoggedIn.next(true);

          // Navigate to seller home or dashboard
          this.router.navigate(['/seller-home']);
        } else {
          console.warn('Login failed: No matching user found');
          // Emit error event through the service
          this.seller.isLoginError.next('Invalid email or password. Please try again.');
        }
      },
      error: (error: unknown) => {
        console.error('Login error:', error);

        // Emit error event through the service
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
