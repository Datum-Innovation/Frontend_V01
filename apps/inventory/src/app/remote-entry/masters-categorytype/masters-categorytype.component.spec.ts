import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MastersCategorytypeComponent } from './masters-categorytype.component';

describe('MastersCategorytypeComponent', () => {
  let component: MastersCategorytypeComponent;
  let fixture: ComponentFixture<MastersCategorytypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MastersCategorytypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MastersCategorytypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
