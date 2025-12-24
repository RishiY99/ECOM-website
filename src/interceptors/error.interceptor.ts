import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const errorHandler = inject(ErrorHandlerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const userFriendlyMessage = errorHandler.handleError(error);

            errorHandler.logError(error, `HTTP ${req.method} ${req.url}`);

            switch (error.status) {
                case 401:
                    break;

                case 403:
                    break;

                case 404:
                    break;

                case 500:
                    break;

                case 0:
                    break;
            }

            return throwError(() => new Error(userFriendlyMessage));
        })
    );
};
