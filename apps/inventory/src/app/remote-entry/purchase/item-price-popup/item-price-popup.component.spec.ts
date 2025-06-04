import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemPricePopupComponent } from './item-price-popup.component';

describe('ItemPricePopupComponent', () => {
  let component: ItemPricePopupComponent;
  let fixture: ComponentFixture<ItemPricePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemPricePopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemPricePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
