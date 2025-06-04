import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserrolepopupComponent } from './userrolepopup.component';

describe('UserrolepopupComponent', () => {
  let component: UserrolepopupComponent;
  let fixture: ComponentFixture<UserrolepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserrolepopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserrolepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
