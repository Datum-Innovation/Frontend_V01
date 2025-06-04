import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemDetailsPopupComponent } from './item-details-popup.component';

describe('ItemDetailsPopupComponent', () => {
  let component: ItemDetailsPopupComponent;
  let fixture: ComponentFixture<ItemDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemDetailsPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
