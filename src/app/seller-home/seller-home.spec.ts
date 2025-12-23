import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerHome } from './seller-home';

describe('SellerHome', () => {
  let component: SellerHome;
  let fixture: ComponentFixture<SellerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
