// ============================================================================
// APP CONFIGURATION
// ============================================================================
// This file configures the entire Angular application
// All global providers and configurations go here
// ============================================================================

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { IMAGE_CONFIG } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// ============================================================================
// NEW IMPORTS FOR HTTP INTERCEPTORS
// ============================================================================
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// provideHttpClient: Provides HttpClient service for making HTTP requests
// withInterceptors: Function to register HTTP interceptors

import { authInterceptor } from '../interceptors/auth.interceptor';
// Our custom auth interceptor (adds auth tokens to requests)

import { errorInterceptor } from '../interceptors/error.interceptor';
// Our custom error interceptor (catches all HTTP errors)

// ============================================================================

export const appConfig: ApplicationConfig = {
  providers: [
    // ==========================================================================
    // GLOBAL ERROR LISTENERS
    // ==========================================================================
    // Catches unhandled errors in the application
    // ==========================================================================
    provideBrowserGlobalErrorListeners(),

    // ==========================================================================
    // ROUTER CONFIGURATION
    // ==========================================================================
    // Provides routing functionality for the app
    // ==========================================================================
    provideRouter(routes),

    // ==========================================================================
    // CLIENT HYDRATION (SSR)
    // ==========================================================================
    // Enables server-side rendering hydration
    // withEventReplay: Replays user events that happened during SSR
    // ==========================================================================
    provideClientHydration(withEventReplay()),

    // ==========================================================================
    // HTTP CLIENT WITH INTERCEPTORS ⭐ NEW
    // ==========================================================================
    // This is the key configuration for HTTP interceptors
    // ==========================================================================
    provideHttpClient(
      // ========================================================================
      // REGISTER INTERCEPTORS
      // ========================================================================
      // withInterceptors() registers our custom interceptors
      // They run in the ORDER they are listed here
      // ========================================================================
      withInterceptors([
        authInterceptor,
        // 1️⃣ Auth Interceptor runs FIRST
        //    - Adds Authorization header to requests
        //    - Runs BEFORE request goes to server

        errorInterceptor
        // 2️⃣ Error Interceptor runs SECOND
        //    - Catches errors from server responses
        //    - Runs AFTER server responds (if error occurs)
      ])
      // ========================================================================
      // INTERCEPTOR EXECUTION ORDER:
      // ========================================================================
      // 
      // REQUEST (Outgoing):
      // Component → authInterceptor → errorInterceptor → Server
      // 
      // RESPONSE (Incoming - Success):
      // Server → errorInterceptor → authInterceptor → Component
      // 
      // RESPONSE (Incoming - Error):
      // Server → errorInterceptor (catches error) → Component
      // 
      // ========================================================================
      // 
      // WHY THIS ORDER?
      // - Auth interceptor adds token BEFORE request is sent
      // - Error interceptor catches errors AFTER response is received
      // - This ensures auth is added even if error occurs
      // 
      // ========================================================================
    ),

    // ==========================================================================
    // IMAGE CONFIGURATION
    // ==========================================================================
    // Disables Angular's image size warnings
    // ==========================================================================
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true
      }
    }
  ]
};

// ============================================================================
// WHAT HAPPENS NOW?
// ============================================================================
//
// ✅ Every HTTP request automatically gets:
//    1. Authorization header (if user is logged in)
//    2. Error handling (if request fails)
//
// ✅ No need to modify service code!
//    - Services just make HTTP calls as normal
//    - Interceptors handle auth and errors automatically
//
// ✅ Centralized control:
//    - Want to change auth header format? Update auth interceptor
//    - Want to add error tracking? Update error interceptor
//    - All requests benefit from the changes
//
// ============================================================================

// ============================================================================
// TESTING THE INTERCEPTORS
// ============================================================================
//
// 1. Login as a user
// 2. Open browser DevTools → Network tab
// 3. Make any API request (search, add product, etc.)
// 4. Click on the request in Network tab
// 5. Check "Request Headers" → Should see Authorization header
// 6. Stop json-server and try again
// 7. Check Console → Should see detailed error logs
//
// ============================================================================
