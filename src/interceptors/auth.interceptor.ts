// ============================================================================
// AUTH INTERCEPTOR
// ============================================================================
// PURPOSE: Automatically add authentication tokens to HTTP requests
// WHY: Instead of manually adding auth headers in every service method,
//      the interceptor does it automatically for ALL requests
// BENEFITS:
// - No need to add auth headers manually in each service
// - Centralized authentication logic
// - Easy to update token handling
// - Automatically handles token expiration
// ============================================================================

import { HttpInterceptorFn } from '@angular/common/http';
// HttpInterceptorFn: Modern Angular 17+ functional interceptor type
// This is the NEW way (functional approach) vs old class-based interceptors

import { inject } from '@angular/core';
// inject(): Function to inject services in functional contexts
// Used because functional interceptors don't have constructors

import { Router } from '@angular/router';
// Router: For redirecting to login page when token is invalid

// ============================================================================
// AUTH INTERCEPTOR FUNCTION
// ============================================================================
// This function runs BEFORE every HTTP request in your app
// It can modify the request (add headers) or handle responses
// ============================================================================
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // ==========================================================================
    // PARAMETERS EXPLAINED:
    // ==========================================================================
    // req: HttpRequest - The outgoing HTTP request
    // next: HttpHandler - Function to pass request to next interceptor or server
    // ==========================================================================

    // Inject Router service for navigation
    const router = inject(Router);
    // inject() is used instead of constructor injection in functional interceptors

    // ============================================================================
    // STEP 1: GET AUTH TOKEN FROM LOCALSTORAGE
    // ============================================================================
    // Check if user is logged in by looking for user data in localStorage
    // In a real app, you might store just the token, not entire user object
    // ============================================================================

    let authToken: string | null = null;
    // Variable to store the authentication token

    // Check if we're in a browser (not server-side rendering)
    if (typeof window !== 'undefined' && localStorage) {
        // ========================================================================
        // GET USER DATA FROM LOCALSTORAGE
        // ========================================================================
        // We check for both 'user' and 'sellerData' because your app has
        // two types of users: regular users and sellers
        // ========================================================================

        const userData = localStorage.getItem('user');
        // Get regular user data

        const sellerData = localStorage.getItem('sellerData');
        // Get seller data

        if (userData) {
            // ======================================================================
            // REGULAR USER IS LOGGED IN
            // ======================================================================
            try {
                const user = JSON.parse(userData);
                // Parse JSON string to object

                authToken = user.id;
                // In your app, you use user ID as token
                // In production, use a proper JWT token instead

                console.log('🔐 Auth Interceptor: User token found:', authToken);
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                // If JSON is corrupted, log error
            }
        } else if (sellerData) {
            // ======================================================================
            // SELLER IS LOGGED IN
            // ======================================================================
            try {
                const seller = JSON.parse(sellerData);
                authToken = seller.id;
                // Use seller ID as token

                console.log('🔐 Auth Interceptor: Seller token found:', authToken);
            } catch (error) {
                console.error('❌ Error parsing seller data:', error);
            }
        }
    }

    // ============================================================================
    // STEP 2: CLONE AND MODIFY REQUEST
    // ============================================================================
    // HTTP requests are IMMUTABLE (cannot be changed)
    // So we must CLONE the request and add headers to the clone
    // ============================================================================

    let modifiedReq = req;
    // Start with original request

    if (authToken) {
        // ==========================================================================
        // ADD AUTHORIZATION HEADER
        // ==========================================================================
        // If we have a token, add it to the request headers
        // The server will check this header to verify the user is authenticated
        // ==========================================================================

        modifiedReq = req.clone({
            // clone() creates a copy of the request with modifications

            setHeaders: {
                // setHeaders: Add or update headers

                Authorization: `Bearer ${authToken}`
                // Standard format: "Bearer <token>"
                // "Bearer" is a common authentication scheme
                // The server expects this format

                // ====================================================================
                // WHAT IS "Bearer"?
                // ====================================================================
                // "Bearer" means "whoever has this token is authorized"
                // It's like a ticket - if you have it, you can enter
                // Common format for JWT tokens
                // ====================================================================
            }
        });

        console.log('✅ Auth header added to request:', req.url);
        // Log which request got the auth header
    } else {
        // ==========================================================================
        // NO TOKEN FOUND
        // ==========================================================================
        // User is not logged in, send request without auth header
        // Some endpoints (like login, signup) don't need authentication
        // ==========================================================================
        console.log('ℹ️ No auth token, sending request without auth header');
    }

    // ============================================================================
    // STEP 3: PASS REQUEST TO NEXT INTERCEPTOR OR SERVER
    // ============================================================================
    // next.handle() sends the request to:
    // - Next interceptor in the chain (if any)
    // - OR directly to the server (if no more interceptors)
    // ============================================================================

    return next(modifiedReq);
    // This returns an Observable<HttpEvent>
    // The response will flow back through the interceptor chain

    // ============================================================================
    // INTERCEPTOR FLOW:
    // ============================================================================
    // 1. Component calls service
    // 2. Service makes HTTP request
    // 3. ⭐ AUTH INTERCEPTOR runs (we are here)
    //    - Adds auth token to headers
    // 4. Request goes to server
    // 5. Server responds
    // 6. Response flows back through interceptors
    // 7. Component receives response
    // ============================================================================
};

// ============================================================================
// ADVANCED: HANDLING 401 UNAUTHORIZED (Optional Enhancement)
// ============================================================================
// You can also handle responses in the interceptor
// For example, redirect to login if token is invalid (401 error)
// ============================================================================
//
// Example with response handling:
//
// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   let authToken = /* get token */;
//
//   let modifiedReq = req;
//   if (authToken) {
//     modifiedReq = req.clone({
//       setHeaders: { Authorization: `Bearer ${authToken}` }
//     });
//   }
//
//   return next(modifiedReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         // Token is invalid or expired
//         console.error('🔒 Unauthorized! Redirecting to login...');
//         localStorage.removeItem('user');
//         localStorage.removeItem('sellerData');
//         router.navigate(['/userauth']);
//       }
//       return throwError(() => error);
//     })
//   );
// };
//
// ============================================================================

// ============================================================================
// HOW TO USE THIS INTERCEPTOR
// ============================================================================
//
// This interceptor is registered in app.config.ts:
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideHttpClient(
//       withInterceptors([authInterceptor])  // ← Register here
//     )
//   ]
// };
//
// Once registered, it runs automatically for ALL HTTP requests!
// No need to modify any service code!
//
// ============================================================================

// ============================================================================
// TESTING THE INTERCEPTOR
// ============================================================================
//
// 1. Login as a user
// 2. Open browser DevTools → Network tab
// 3. Make any API request (search, add to cart, etc.)
// 4. Click on the request in Network tab
// 5. Check "Request Headers" section
// 6. You should see: Authorization: Bearer <your-user-id>
//
// ============================================================================
