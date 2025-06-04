import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancepopupComponent } from './advancepopup.component';

describe('AdvancepopupComponent', () => {
  let component: AdvancepopupComponent;
  let fixture: ComponentFixture<AdvancepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvancepopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
