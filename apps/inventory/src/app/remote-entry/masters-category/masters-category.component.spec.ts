import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MastersCategoryComponent } from './masters-category.component';

describe('MastersCategoryComponent', () => {
  let component: MastersCategoryComponent;
  let fixture: ComponentFixture<MastersCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MastersCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MastersCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
