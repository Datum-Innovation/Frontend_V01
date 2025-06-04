import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptvoucherComponent } from './receiptvoucher.component';

describe('ReceiptvoucherComponent', () => {
  let component: ReceiptvoucherComponent;
  let fixture: ComponentFixture<ReceiptvoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceiptvoucherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
