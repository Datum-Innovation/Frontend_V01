import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryInComponent } from './delivery-in.component';

describe('DeliveryInComponent', () => {
  let component: DeliveryInComponent;
  let fixture: ComponentFixture<DeliveryInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryInComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
