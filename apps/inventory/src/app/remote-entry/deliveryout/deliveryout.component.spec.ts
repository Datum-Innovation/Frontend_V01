import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryoutComponent } from './deliveryout.component';

describe('DeliveryoutComponent', () => {
  let component: DeliveryoutComponent;
  let fixture: ComponentFixture<DeliveryoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
