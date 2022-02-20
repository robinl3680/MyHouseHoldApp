import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreLogicService } from './core-logic.service';
import { ItemsService } from './items.service';
import { PersonService } from './person.service';

describe('CoreLogicService', () => {
  let service: CoreLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    const personService = TestBed.inject(PersonService);
    const itemService = TestBed.inject(ItemsService);
    service = TestBed.inject(CoreLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
