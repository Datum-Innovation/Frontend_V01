import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SizemasterComponent } from './sizemaster.component';

describe('SizemasterComponent', () => {
  let component: SizemasterComponent;
  let fixture: ComponentFixture<SizemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SizemasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SizemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
