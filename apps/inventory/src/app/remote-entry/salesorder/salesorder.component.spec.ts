import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesorderComponent } from './salesorder.component';

describe('SalesorderComponent', () => {
  let component: SalesorderComponent;
  let fixture: ComponentFixture<SalesorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesorderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
