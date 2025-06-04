import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricecategorypopupComponent } from './pricecategorypopup.component';

describe('PricecategorypopupComponent', () => {
  let component: PricecategorypopupComponent;
  let fixture: ComponentFixture<PricecategorypopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricecategorypopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricecategorypopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
