import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalancedialogComponent } from './balancedialog.component';

describe('BalancedialogComponent', () => {
  let component: BalancedialogComponent;
  let fixture: ComponentFixture<BalancedialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BalancedialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalancedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
