import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyMenuComponent } from './dummy-menu.component';

describe('DummyMenuComponent', () => {
  let component: DummyMenuComponent;
  let fixture: ComponentFixture<DummyMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DummyMenuComponent]
    });
    fixture = TestBed.createComponent(DummyMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
