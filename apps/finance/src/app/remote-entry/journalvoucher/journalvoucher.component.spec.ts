import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalvoucherComponent } from './journalvoucher.component';

describe('JournalvoucherComponent', () => {
  let component: JournalvoucherComponent;
  let fixture: ComponentFixture<JournalvoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JournalvoucherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
