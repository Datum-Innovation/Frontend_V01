import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchitemsComponent } from './branchitems.component';

describe('BranchitemsComponent', () => {
  let component: BranchitemsComponent;
  let fixture: ComponentFixture<BranchitemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BranchitemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
