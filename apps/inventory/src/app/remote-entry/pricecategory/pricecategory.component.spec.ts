import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricecategoryComponent } from './pricecategory.component';

describe('PricecategoryComponent', () => {
  let component: PricecategoryComponent;
  let fixture: ComponentFixture<PricecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricecategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
