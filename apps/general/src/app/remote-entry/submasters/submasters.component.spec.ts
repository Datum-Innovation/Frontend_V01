import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmastersComponent } from './submasters.component';

describe('SubmastersComponent', () => {
  let component: SubmastersComponent;
  let fixture: ComponentFixture<SubmastersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmastersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmastersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
