import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Only check localStorage in browser environment
  if (isPlatformBrowser(platformId)) {
    // Check for sellerData (what's stored during signup)
    const sellerData = localStorage.getItem('sellerData');

    if (sellerData) {
      // User is authenticated, allow access
      return true;
    } else {
      // User is not authenticated, redirect to seller-auth
      router.navigate(['/seller-auth']);
      return false;
    }
  }

  // Allow navigation on server-side
  return true;
};
