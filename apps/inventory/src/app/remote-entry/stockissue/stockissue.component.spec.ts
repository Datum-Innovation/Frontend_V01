import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockissueComponent } from './stockissue.component';

describe('StockissueComponent', () => {
  let component: StockissueComponent;
  let fixture: ComponentFixture<StockissueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockissueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockissueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
