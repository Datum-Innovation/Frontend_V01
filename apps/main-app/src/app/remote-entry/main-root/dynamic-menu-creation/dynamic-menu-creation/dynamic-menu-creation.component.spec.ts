import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMenuCreationComponent } from './dynamic-menu-creation.component';

describe('DynamicMenuCreationComponent', () => {
  let component: DynamicMenuCreationComponent;
  let fixture: ComponentFixture<DynamicMenuCreationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicMenuCreationComponent]
    });
    fixture = TestBed.createComponent(DynamicMenuCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
