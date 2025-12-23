import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const sellerAuthGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // Only check localStorage in browser environment
    if (isPlatformBrowser(platformId)) {
        // Check if seller data exists in local storage
        const sellerData = localStorage.getItem('sellerData');

        if (sellerData) {
            // User is already logged in, redirect to seller home
            router.navigate(['/seller-home']);
            return false;
        }
    }

    // User is not logged in, allow access to auth page
    return true;
};
