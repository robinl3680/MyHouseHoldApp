import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliptUpComponent } from './slipt-up.component';

describe('SliptUpComponent', () => {
  let component: SliptUpComponent;
  let fixture: ComponentFixture<SliptUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliptUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliptUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
