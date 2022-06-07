import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntroductionComponent } from './app-introduction.component';

describe('AppIntroductionComponent', () => {
  let component: AppIntroductionComponent;
  let fixture: ComponentFixture<AppIntroductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntroductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
