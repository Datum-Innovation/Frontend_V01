import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerSupplierComponent } from './customer-supplier.component';

describe('CustomerSupplierComponent', () => {
  let component: CustomerSupplierComponent;
  let fixture: ComponentFixture<CustomerSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerSupplierComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
