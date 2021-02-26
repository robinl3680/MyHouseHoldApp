import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedDataViewComponent } from './detailed-data-view.component';

describe('DetailedDataViewComponent', () => {
  let component: DetailedDataViewComponent;
  let fixture: ComponentFixture<DetailedDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailedDataViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
