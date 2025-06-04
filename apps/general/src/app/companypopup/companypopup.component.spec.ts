import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanypopupComponent } from './companypopup.component';

describe('CompanypopupComponent', () => {
  let component: CompanypopupComponent;
  let fixture: ComponentFixture<CompanypopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanypopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanypopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
