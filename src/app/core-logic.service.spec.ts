import { TestBed } from '@angular/core/testing';

import { CoreLogicService } from './core-logic.service';

describe('CoreLogicService', () => {
  let service: CoreLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
