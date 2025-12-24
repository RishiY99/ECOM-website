import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    let authToken: string | null = null;

    if (typeof window !== 'undefined' && localStorage) {
        const userData = localStorage.getItem('user');

        const sellerData = localStorage.getItem('sellerData');

        if (userData) {
            try {
                const user = JSON.parse(userData);
                authToken = user.id;
            } catch (error) {
            }
        } else if (sellerData) {
            try {
                const seller = JSON.parse(sellerData);
                authToken = seller.id;
            } catch (error) {
            }
        }
    }

    let modifiedReq = req;

    if (authToken) {
        modifiedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authToken}`
            }
        });
    } else {
    }

    return next(modifiedReq);
};
