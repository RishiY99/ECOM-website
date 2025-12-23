import { TestBed } from '@angular/core/testing';

import { Seller } from './seller';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';

describe('Seller', () => {
  let service: Seller;
  let httpMock: HttpTestingController;
  let errorHandlerMock: any;

  beforeEach(() => {
    errorHandlerMock = {
      handleError: vi.fn().mockReturnValue('error Message'),
      logError: vi.fn()
    }
    TestBed.configureTestingModule({
      providers: [
        Seller,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    });
    service = TestBed.inject(Seller);
    httpMock = TestBed.inject(HttpTestingController);
  });


  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});
