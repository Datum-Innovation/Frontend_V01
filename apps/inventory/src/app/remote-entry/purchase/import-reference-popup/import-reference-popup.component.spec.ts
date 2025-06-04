import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportReferencePopupComponent } from './import-reference-popup.component';

describe('ImportReferencePopupComponent', () => {
  let component: ImportReferencePopupComponent;
  let fixture: ComponentFixture<ImportReferencePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportReferencePopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportReferencePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
