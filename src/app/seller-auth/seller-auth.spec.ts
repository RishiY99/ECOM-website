import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerAuth } from './seller-auth';

describe('SellerAuth', () => {
  let component: SellerAuth;
  let fixture: ComponentFixture<SellerAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerAuth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerAuth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
