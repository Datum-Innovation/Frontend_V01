import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationtypeComponent } from './locationtype.component';

describe('LocationtypeComponent', () => {
  let component: LocationtypeComponent;
  let fixture: ComponentFixture<LocationtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationtypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
