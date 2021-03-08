import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleUserGroupsComponent } from './handle-user-groups.component';

describe('HandleUserGroupsComponent', () => {
  let component: HandleUserGroupsComponent;
  let fixture: ComponentFixture<HandleUserGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandleUserGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleUserGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
