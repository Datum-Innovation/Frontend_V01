import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemratesPopupComponent } from './itemrates-popup.component';

describe('ItemratesPopupComponent', () => {
  let component: ItemratesPopupComponent;
  let fixture: ComponentFixture<ItemratesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemratesPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemratesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
