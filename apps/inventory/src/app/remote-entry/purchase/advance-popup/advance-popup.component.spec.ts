import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancePopupComponent } from './advance-popup.component';

describe('AdvancePopupComponent', () => {
  let component: AdvancePopupComponent;
  let fixture: ComponentFixture<AdvancePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvancePopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
