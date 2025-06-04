import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesestimateComponent } from './salesestimate.component';

describe('SalesestimateComponent', () => {
  let component: SalesestimateComponent;
  let fixture: ComponentFixture<SalesestimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesestimateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesestimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
