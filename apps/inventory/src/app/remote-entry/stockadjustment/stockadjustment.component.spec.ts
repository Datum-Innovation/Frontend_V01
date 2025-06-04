import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockadjustmentComponent } from './stockadjustment.component';

describe('StockadjustmentComponent', () => {
  let component: StockadjustmentComponent;
  let fixture: ComponentFixture<StockadjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockadjustmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockadjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
