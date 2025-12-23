import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerUpdateForm } from './seller-update-form';

describe('SellerUpdateForm', () => {
  let component: SellerUpdateForm;
  let fixture: ComponentFixture<SellerUpdateForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerUpdateForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerUpdateForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
