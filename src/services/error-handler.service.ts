import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    constructor() { }

    handleError(error: any): string {
        let errorMessage = '';

        if (error instanceof HttpErrorResponse) {
            if (error.error instanceof ErrorEvent) {
                errorMessage = `Network Error: ${error.error.message}`;
            } else {
                switch (error.status) {
                    case 0:
                        errorMessage = 'Unable to connect to server. Please check your internet connection.';
                        break;

                    case 400:
                        errorMessage = 'Invalid request. Please check your input and try again.';
                        break;

                    case 401:
                        errorMessage = 'You are not authorized. Please log in again.';
                        break;

                    case 403:
                        errorMessage = 'You do not have permission to perform this action.';
                        break;

                    case 404:
                        errorMessage = 'The requested resource was not found.';
                        break;

                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;

                    case 503:
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                        break;

                    default:
                        errorMessage = `Server error (${error.status}): ${error.message}`;
                }
            }
        } else {
            errorMessage = `An unexpected error occurred: ${error.message || error}`;
        }

        return errorMessage;
    }

    logError(error: any, context?: string): void {
        const timestamp = new Date().toISOString();

        console.group(`Error Log - ${timestamp}`);

        if (context) {
        }

        console.groupEnd();
    }

    showErrorNotification(message: string): void {
    }
}
