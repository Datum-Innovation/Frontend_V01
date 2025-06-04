import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemarksPopupComponent } from './remarks-popup.component';

describe('RemarksPopupComponent', () => {
  let component: RemarksPopupComponent;
  let fixture: ComponentFixture<RemarksPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemarksPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemarksPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
