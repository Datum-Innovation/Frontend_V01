import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralregisterComponent } from './generalregister.component';

describe('GeneralregisterComponent', () => {
  let component: GeneralregisterComponent;
  let fixture: ComponentFixture<GeneralregisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralregisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
