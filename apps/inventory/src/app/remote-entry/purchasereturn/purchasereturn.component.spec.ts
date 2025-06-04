import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchasereturnComponent } from './purchasereturn.component';

describe('PurchasereturnComponent', () => {
  let component: PurchasereturnComponent;
  let fixture: ComponentFixture<PurchasereturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchasereturnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchasereturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
