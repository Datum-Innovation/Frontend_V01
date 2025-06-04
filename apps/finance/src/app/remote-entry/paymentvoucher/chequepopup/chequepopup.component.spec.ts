import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChequepopupComponent } from './chequepopup.component';

describe('ChequepopupComponent', () => {
  let component: ChequepopupComponent;
  let fixture: ComponentFixture<ChequepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChequepopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChequepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
