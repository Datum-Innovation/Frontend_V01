import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageLocalizationComponent } from './language-localization.component';

describe('LanguageLocalizationComponent', () => {
  let component: LanguageLocalizationComponent;
  let fixture: ComponentFixture<LanguageLocalizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LanguageLocalizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageLocalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
