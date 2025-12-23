// ============================================================================
// ERROR HANDLER SERVICE
// ============================================================================
// PURPOSE: Centralized error handling for the entire application
// WHY: Instead of handling errors in every component, we handle them in one place
// BENEFITS:
// - Consistent error messages across the app
// - Easy to update error handling logic
// - Better user experience with friendly messages
// - Easier debugging with detailed logging
// ============================================================================

import { Injectable } from '@angular/core';
// Injectable decorator makes this class available for dependency injection
// This means we can inject this service into any component or service

import { HttpErrorResponse } from '@angular/common/http';
// HttpErrorResponse is Angular's class for HTTP errors
// It contains status code, error message, and other useful info

@Injectable({
    providedIn: 'root'
    // providedIn: 'root' makes this a SINGLETON service
    // Singleton = only ONE instance exists for the entire app
    // This ensures all components share the same error handler
})
export class ErrorHandlerService {

    constructor() { }

    // ============================================================================
    // HANDLE ERROR METHOD
    // ============================================================================
    // This is the main method that processes all errors
    // It takes any error and returns a user-friendly message
    // ============================================================================
    handleError(error: any): string {
        // Declare variable to store the error message we'll show to users
        let errorMessage = '';

        // ============================================================================
        // CHECK ERROR TYPE: Client-Side vs Server-Side
        // ============================================================================
        // There are 2 types of errors:
        // 1. HttpErrorResponse = Server/Network errors (API down, 404, 500, etc.)
        // 2. Regular Error = Client-side errors (JavaScript errors, null reference, etc.)
        // ============================================================================

        if (error instanceof HttpErrorResponse) {
            // ========================================================================
            // HTTP ERROR (Server/Network Error)
            // ========================================================================
            // This happens when:
            // - API server is down
            // - Network connection lost
            // - 404 Not Found
            // - 500 Internal Server Error
            // - 401 Unauthorized
            // etc.
            // ========================================================================

            if (error.error instanceof ErrorEvent) {
                // ======================================================================
                // CLIENT-SIDE NETWORK ERROR
                // ======================================================================
                // This is a network error that happened on the client side
                // Examples: No internet connection, DNS failure, CORS error
                // ======================================================================
                errorMessage = `Network Error: ${error.error.message}`;
                // Show the actual error message from the ErrorEvent

                console.error('Client-side network error:', error.error.message);
                // Log to console for developers to debug
            } else {
                // ======================================================================
                // SERVER-SIDE HTTP ERROR
                // ======================================================================
                // The server responded with an error status code
                // Examples: 404, 500, 401, 403, etc.
                // ======================================================================

                // Switch statement to handle different HTTP status codes
                switch (error.status) {
                    case 0:
                        // Status 0 means the request didn't reach the server at all
                        // Usually means: server is down, CORS issue, or network failure
                        errorMessage = 'Unable to connect to server. Please check your internet connection.';
                        break;

                    case 400:
                        // Bad Request - The request was invalid
                        errorMessage = 'Invalid request. Please check your input and try again.';
                        break;

                    case 401:
                        // Unauthorized - User is not logged in or token expired
                        errorMessage = 'You are not authorized. Please log in again.';
                        break;

                    case 403:
                        // Forbidden - User doesn't have permission
                        errorMessage = 'You do not have permission to perform this action.';
                        break;

                    case 404:
                        // Not Found - The requested resource doesn't exist
                        errorMessage = 'The requested resource was not found.';
                        break;

                    case 500:
                        // Internal Server Error - Something went wrong on the server
                        errorMessage = 'Server error. Please try again later.';
                        break;

                    case 503:
                        // Service Unavailable - Server is temporarily down
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                        break;

                    default:
                        // Any other HTTP error code
                        // Show generic message with status code for debugging
                        errorMessage = `Server error (${error.status}): ${error.message}`;
                }

                // Log detailed error info to console for developers
                console.error(
                    `Server Error - Status: ${error.status}, ` +
                    `Message: ${error.message}, ` +
                    `URL: ${error.url}`
                );
            }
        } else {
            // ========================================================================
            // CLIENT-SIDE ERROR (JavaScript Error)
            // ========================================================================
            // This is a regular JavaScript error
            // Examples: TypeError, ReferenceError, null pointer, etc.
            // These are usually bugs in our code
            // ========================================================================

            errorMessage = `An unexpected error occurred: ${error.message || error}`;
            // Use error.message if available, otherwise convert error to string

            console.error('Client-side error:', error);
            // Log full error object for debugging
        }

        // ============================================================================
        // RETURN USER-FRIENDLY MESSAGE
        // ============================================================================
        // Return the error message so components can display it to users
        // This keeps error messages consistent across the entire app
        // ============================================================================
        return errorMessage;
    }

    // ============================================================================
    // LOG ERROR METHOD (Optional - for future use)
    // ============================================================================
    // This method can be used to send errors to a logging service
    // Examples: Sentry, LogRocket, Google Analytics, etc.
    // For now, we just log to console, but you can extend this
    // ============================================================================
    logError(error: any, context?: string): void {
        // context = where the error happened (e.g., 'ProductService.getProducts')

        const timestamp = new Date().toISOString();
        // Get current time in ISO format for logging

        console.group(`🔴 Error Log - ${timestamp}`);
        // console.group creates a collapsible group in browser console

        if (context) {
            console.log('Context:', context);
            // Show where the error happened
        }

        console.error('Error:', error);
        // Log the actual error

        console.groupEnd();
        // Close the console group

        // ============================================================================
        // FUTURE ENHANCEMENT: Send to external logging service
        // ============================================================================
        // Uncomment and configure when you want to send errors to a service:
        // 
        // this.http.post('https://your-logging-service.com/api/errors', {
        //   timestamp,
        //   context,
        //   error: error.message,
        //   stack: error.stack,
        //   userAgent: navigator.userAgent
        // }).subscribe();
        // ============================================================================
    }

    // ============================================================================
    // SHOW USER NOTIFICATION (Optional - for future use)
    // ============================================================================
    // This method can be used with a toast/snackbar library
    // Examples: Angular Material Snackbar, ngx-toastr, etc.
    // For now, we just return the message, but you can extend this
    // ============================================================================
    showErrorNotification(message: string): void {
        // For now, we'll use a simple alert
        // In production, replace with a proper notification library

        // alert(message); // Simple but not user-friendly

        // ============================================================================
        // FUTURE ENHANCEMENT: Use Angular Material Snackbar
        // ============================================================================
        // Install: npm install @angular/material
        // Import: MatSnackBar from '@angular/material/snack-bar'
        // Usage:
        // this.snackBar.open(message, 'Close', {
        //   duration: 5000,
        //   horizontalPosition: 'end',
        //   verticalPosition: 'top',
        //   panelClass: ['error-snackbar']
        // });
        // ============================================================================

        console.warn('Error notification:', message);
        // For now, just log to console
    }
}

// ============================================================================
// HOW TO USE THIS SERVICE
// ============================================================================
//
// In any component or service:
//
// 1. Inject the service:
//    constructor(private errorHandler: ErrorHandlerService) {}
//
// 2. Use it in error handling:
//    this.http.get(url).subscribe({
//      next: (data) => { /* success */ },
//      error: (error) => {
//        const message = this.errorHandler.handleError(error);
//        alert(message); // or display in UI
//      }
//    });
//
// ============================================================================
