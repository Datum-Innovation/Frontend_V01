import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DosagemasterComponent } from './dosagemaster.component';

describe('DosagemasterComponent', () => {
  let component: DosagemasterComponent;
  let fixture: ComponentFixture<DosagemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DosagemasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DosagemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
