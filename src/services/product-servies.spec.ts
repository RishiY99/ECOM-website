// ============================================================================
// PRODUCT SERVICE UNIT TESTS (VITEST)
// ============================================================================
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductServies } from './product-servies';
import { product } from './types';
import { ErrorHandlerService } from './error-handler.service';
import { vi } from 'vitest';

describe('ProductServies', () => {
  let service: ProductServies;
  let httpMock: HttpTestingController;
  let errorHandlerMock: any;

  beforeEach(() => {
    errorHandlerMock = {
      handleError: vi.fn().mockReturnValue('Error message'),
      logError: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ProductServies,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    });

    service = TestBed.inject(ProductServies);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch product list successfully', () => {
    const mockProducts: product[] = [
      {
        id: '1',
        name: 'Test Product',
        price: 100,
        color: 'Black',
        description: 'Test',
        image: 'test.jpg',
        quantity: 1,
        product_id: undefined
      }
    ];

    service.productList().subscribe({
      next: (products) => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(1);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should handle error when fetching products fails', () => {
    service.productList().subscribe({
      next: (products) => {
        expect(products).toEqual([]);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/products');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should add a new product successfully', () => {
    const newProduct: product = {
      id: '2',
      name: 'New Product',
      price: 200,
      color: 'Red',
      description: 'New',
      image: 'new.jpg',
      quantity: 1,
      product_id: undefined
    };

    service.SellerAddProduct(newProduct).subscribe({
      next: (response) => {
        expect(response).toEqual(newProduct);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(newProduct);
  });

  it('should search products by query', () => {
    const searchQuery = 'laptop';
    const mockResults: product[] = [
      {
        id: '1',
        name: 'Gaming Laptop',
        price: 1000,
        color: 'Black',
        description: 'High-end gaming laptop',
        image: 'laptop.jpg',
        quantity: 1,
        product_id: undefined
      }
    ];

    service.serachProducts(searchQuery).subscribe({
      next: (results) => {
        expect(results).toEqual(mockResults);
        expect(results.length).toBe(1);
      }
    });

    const req = httpMock.expectOne(`http://localhost:3000/products?q=${searchQuery}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });
});
