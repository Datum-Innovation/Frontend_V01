import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreamasterComponent } from './areamaster.component';

describe('AreamasterComponent', () => {
  let component: AreamasterComponent;
  let fixture: ComponentFixture<AreamasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AreamasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AreamasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
