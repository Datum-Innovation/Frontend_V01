import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesreturnComponent } from './salesreturn.component';

describe('SalesreturnComponent', () => {
  let component: SalesreturnComponent;
  let fixture: ComponentFixture<SalesreturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesreturnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesreturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
