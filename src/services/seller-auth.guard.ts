import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const sellerAuthGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
        const sellerData = localStorage.getItem('sellerData');

        if (sellerData) {
            router.navigate(['/seller-home']);
            return false;
        }
    }

    return true;
};
