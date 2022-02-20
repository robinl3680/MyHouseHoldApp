import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PurchaseDetailsService } from 'src/app/purchase-details.service';

import { DetailedDataViewComponent } from './detailed-data-view.component';

describe('DetailedDataViewComponent', () => {
  let component: DetailedDataViewComponent;
  let fixture: ComponentFixture<DetailedDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailedDataViewComponent ],
      providers: [ PurchaseDetailsService, 
        {
          provide: ActivatedRoute, 
          useValue: {
            params: of({ id: 'test' }),
            queryParams: of({ id: 'test' })
          }
        }
      ]
    })
    .compileComponents();
    const purchaseService = TestBed.inject(PurchaseDetailsService);
    spyOn(purchaseService, 'onDetailedItemViewClick').and.returnValue([
      {
        item: 'sample',
        amount: 20,
        date: new Date(),
        person: 'Robin',
        key: '_sample',
        _id: '_sample',
        personsDistributedAmounts: [],
        multiPerson: false,
        individualTransaction: { 'robin': 100 }
      }
    ])
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have category sample', () => {
    const h4Elem: HTMLElement = fixture.debugElement.query(By.css('h4')).nativeElement;
    expect(h4Elem.textContent).toEqual('Category: sample');
  })



});
