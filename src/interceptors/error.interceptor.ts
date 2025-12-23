// ============================================================================
// ERROR INTERCEPTOR
// ============================================================================
// PURPOSE: Catch ALL HTTP errors in one place
// WHY: Instead of handling errors in every service method,
//      this interceptor catches them globally
// BENEFITS:
// - Centralized error handling
// - Consistent error logging
// - Easy to add error tracking (Sentry, LogRocket, etc.)
// - Can show global error notifications
// ============================================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// HttpInterceptorFn: Functional interceptor type (Angular 17+)
// HttpErrorResponse: Type for HTTP error responses

import { inject } from '@angular/core';
// inject(): Get services in functional context

import { catchError, throwError } from 'rxjs';
// catchError: RxJS operator to catch errors in Observable stream
// throwError: Create an Observable that immediately errors

import { ErrorHandlerService } from '../services/error-handler.service';
// Our custom error handler service

// ============================================================================
// ERROR INTERCEPTOR FUNCTION
// ============================================================================
// This runs AFTER every HTTP request completes
// If the request fails, this interceptor catches the error
// ============================================================================
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    // ==========================================================================
    // INJECT SERVICES
    // ==========================================================================
    // Get our error handler service to process errors
    // ==========================================================================
    const errorHandler = inject(ErrorHandlerService);

    // ============================================================================
    // PASS REQUEST TO NEXT HANDLER
    // ============================================================================
    // next.handle() sends the request forward
    // It returns an Observable that we can pipe operators to
    // ============================================================================
    return next(req).pipe(
        // ==========================================================================
        // PIPE: Chain RxJS operators
        // ==========================================================================
        // We use pipe() to add error handling to the response stream
        // ==========================================================================

        catchError((error: HttpErrorResponse) => {
            // ========================================================================
            // CATCHERROR: Intercept ALL HTTP errors
            // ========================================================================
            // This runs whenever ANY HTTP request in the app fails
            // error: HttpErrorResponse contains all error details
            // ========================================================================

            // ========================================================================
            // LOG ERROR DETAILS
            // ========================================================================
            // Log comprehensive error information for debugging
            // ========================================================================
            console.group('🔴 HTTP Error Intercepted');
            // console.group creates a collapsible group in browser console

            console.error('URL:', req.url);
            // Which endpoint failed?

            console.error('Method:', req.method);
            // Was it GET, POST, PUT, DELETE?

            console.error('Status:', error.status);
            // HTTP status code (404, 500, etc.)

            console.error('Error:', error.message);
            // Error message

            console.error('Full Error Object:', error);
            // Complete error details

            console.groupEnd();
            // Close the console group

            // ========================================================================
            // USE ERROR HANDLER SERVICE
            // ========================================================================
            // Convert technical error to user-friendly message
            // ========================================================================
            const userFriendlyMessage = errorHandler.handleError(error);

            // Log with context for debugging
            errorHandler.logError(error, `HTTP ${req.method} ${req.url}`);

            // ========================================================================
            // HANDLE SPECIFIC ERROR CODES
            // ========================================================================
            // You can add special handling for specific status codes
            // ========================================================================
            switch (error.status) {
                case 401:
                    // ====================================================================
                    // UNAUTHORIZED - Token invalid or expired
                    // ====================================================================
                    console.warn('🔒 Unauthorized access detected');

                    // Optional: Redirect to login
                    // const router = inject(Router);
                    // router.navigate(['/userauth']);

                    // Optional: Clear invalid tokens
                    // localStorage.removeItem('user');
                    // localStorage.removeItem('sellerData');
                    break;

                case 403:
                    // ====================================================================
                    // FORBIDDEN - User doesn't have permission
                    // ====================================================================
                    console.warn('⛔ Access forbidden');
                    break;

                case 404:
                    // ====================================================================
                    // NOT FOUND - Resource doesn't exist
                    // ====================================================================
                    console.warn('🔍 Resource not found:', req.url);
                    break;

                case 500:
                    // ====================================================================
                    // SERVER ERROR - Something wrong on server
                    // ====================================================================
                    console.error('💥 Server error - please try again later');
                    break;

                case 0:
                    // ====================================================================
                    // NETWORK ERROR - Can't reach server
                    // ====================================================================
                    console.error('📡 Network error - check internet connection');
                    break;
            }

            // ========================================================================
            // OPTIONAL: SHOW ERROR NOTIFICATION
            // ========================================================================
            // You can show a toast/snackbar notification here
            // ========================================================================
            // errorHandler.showErrorNotification(userFriendlyMessage);

            // ========================================================================
            // OPTIONAL: SEND TO ERROR TRACKING SERVICE
            // ========================================================================
            // Send error to Sentry, LogRocket, Google Analytics, etc.
            // ========================================================================
            // Example with Sentry:
            // if (error.status >= 500) {
            //   Sentry.captureException(error);
            // }

            // ========================================================================
            // RE-THROW ERROR
            // ========================================================================
            // Create a new error Observable with user-friendly message
            // This allows services/components to still handle the error if needed
            // ========================================================================
            return throwError(() => new Error(userFriendlyMessage));
            // throwError(() => ...) is the modern RxJS 7+ syntax
            // The error will propagate to the service/component that made the request
        })
    );
};

// ============================================================================
// HOW THIS INTERCEPTOR WORKS
// ============================================================================
//
// REQUEST FLOW:
// 1. Component calls service method
// 2. Service makes HTTP request
// 3. Auth Interceptor adds token (if needed)
// 4. Request goes to server
// 5. Server responds (success or error)
// 6. ⭐ ERROR INTERCEPTOR runs (if error occurred)
//    - Logs error details
//    - Converts to user-friendly message
//    - Can show notifications
//    - Can redirect user
//    - Re-throws error for service/component
// 7. Service/component receives error or success
//
// ============================================================================

// ============================================================================
// INTERCEPTOR CHAIN
// ============================================================================
//
// Multiple interceptors run in order:
//
// Request Flow (Outgoing):
// Component → Auth Interceptor → Error Interceptor → Server
//
// Response Flow (Incoming):
// Server → Error Interceptor → Auth Interceptor → Component
//
// If error occurs:
// Server → ⭐ Error Interceptor catches it → Component
//
// ============================================================================

// ============================================================================
// BENEFITS OF GLOBAL ERROR INTERCEPTOR
// ============================================================================
//
// ✅ Centralized Error Handling
//    - All errors handled in one place
//    - Consistent error messages
//    - Easy to update error handling logic
//
// ✅ Automatic Error Logging
//    - Every error is logged automatically
//    - No need to add logging in each service
//    - Easy to integrate with error tracking services
//
// ✅ Better User Experience
//    - Can show global error notifications
//    - Can redirect on auth errors
//    - Can retry failed requests
//
// ✅ Easier Debugging
//    - Detailed error logs in console
//    - Context about which request failed
//    - Full error details available
//
// ============================================================================

// ============================================================================
// TESTING THE ERROR INTERCEPTOR
// ============================================================================
//
// Test 1: Network Error
// 1. Stop json-server
// 2. Try to load products
// 3. Check console - should see detailed error log
// 4. Should see user-friendly error message
//
// Test 2: 404 Error
// 1. Try to access non-existent product
// 2. Check console - should see 404 error logged
// 3. Should see "Resource not found" message
//
// Test 3: 500 Server Error
// 1. Modify db.json to cause server error
// 2. Try to make request
// 3. Check console - should see 500 error logged
// 4. Should see "Server error" message
//
// ============================================================================

// ============================================================================
// REGISTRATION
// ============================================================================
//
// Register in app.config.ts:
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideHttpClient(
//       withInterceptors([
//         authInterceptor,     // Runs first (adds auth)
//         errorInterceptor     // Runs second (catches errors)
//       ])
//     )
//   ]
// };
//
// Order matters! Auth interceptor should run before error interceptor
//
// ============================================================================
