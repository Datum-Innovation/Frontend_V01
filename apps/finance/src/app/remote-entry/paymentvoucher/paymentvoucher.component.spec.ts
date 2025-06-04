import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentvoucherComponent } from './paymentvoucher.component';

describe('PaymentvoucherComponent', () => {
  let component: PaymentvoucherComponent;
  let fixture: ComponentFixture<PaymentvoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentvoucherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
