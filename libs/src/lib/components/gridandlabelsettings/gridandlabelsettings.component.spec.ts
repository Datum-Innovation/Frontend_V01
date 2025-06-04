import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridandlabelsettingsComponent } from './gridandlabelsettings.component';

describe('GridandlabelsettingsComponent', () => {
  let component: GridandlabelsettingsComponent;
  let fixture: ComponentFixture<GridandlabelsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridandlabelsettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GridandlabelsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
