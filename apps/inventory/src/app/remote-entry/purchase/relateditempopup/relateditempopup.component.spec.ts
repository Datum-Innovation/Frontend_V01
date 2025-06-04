import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelateditempopupComponent } from './relateditempopup.component';

describe('RelateditempopupComponent', () => {
  let component: RelateditempopupComponent;
  let fixture: ComponentFixture<RelateditempopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelateditempopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelateditempopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
