import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalAdvancePopupComponent } from './journal-advance-popup.component';
//import { AdvancePopupComponent } from './advance-popup.component';

describe('AdvancePopupComponent', () => {
  let component: JournalAdvancePopupComponent;
  let fixture: ComponentFixture<JournalAdvancePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalAdvancePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
