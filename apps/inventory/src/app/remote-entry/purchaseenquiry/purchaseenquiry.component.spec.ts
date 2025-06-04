import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseenquiryComponent } from './purchaseenquiry.component';

describe('PurchaseenquiryComponent', () => {
  let component: PurchaseenquiryComponent;
  let fixture: ComponentFixture<PurchaseenquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchaseenquiryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseenquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
