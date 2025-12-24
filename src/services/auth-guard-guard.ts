import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const sellerData = localStorage.getItem('sellerData');

    if (sellerData) {
      return true;
    } else {
      router.navigate(['/seller-auth']);
      return false;
    }
  }

  return true;
};
