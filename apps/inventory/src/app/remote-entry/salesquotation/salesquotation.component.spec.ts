import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesquotationComponent } from './salesquotation.component';

describe('SalesquotationComponent', () => {
  let component: SalesquotationComponent;
  let fixture: ComponentFixture<SalesquotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesquotationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesquotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
