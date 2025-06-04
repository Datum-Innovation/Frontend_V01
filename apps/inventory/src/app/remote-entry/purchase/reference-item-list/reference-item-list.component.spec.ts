import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferenceItemListComponent } from './reference-item-list.component';

describe('ReferenceItemListComponent', () => {
  let component: ReferenceItemListComponent;
  let fixture: ComponentFixture<ReferenceItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceItemListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReferenceItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
