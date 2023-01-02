import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RexfroComponent } from './rexfro.component';

describe('RexfroComponent', () => {
  let component: RexfroComponent;
  let fixture: ComponentFixture<RexfroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RexfroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RexfroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
