import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpeningstockComponent } from './openingstock.component';

describe('OpeningstockComponent', () => {
  let component: OpeningstockComponent;
  let fixture: ComponentFixture<OpeningstockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpeningstockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpeningstockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
