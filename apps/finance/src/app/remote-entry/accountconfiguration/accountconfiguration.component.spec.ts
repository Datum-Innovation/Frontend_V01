import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountconfigurationComponent } from './accountconfiguration.component';

describe('AccountconfigurationComponent', () => {
  let component: AccountconfigurationComponent;
  let fixture: ComponentFixture<AccountconfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountconfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
