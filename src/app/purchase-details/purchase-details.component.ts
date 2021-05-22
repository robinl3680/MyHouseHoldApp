import { Component, OnInit } from '@angular/core';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { ItemsService } from '../items.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../app-auth/auth.service';
import { FilterService } from '../filter-component/filter.service';
import { CoreLogicService } from '../core-logic.service';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.component.html',
  styleUrls: ['./purchase-details.component.css']
})
export class PurchaseDetailsComponent implements OnInit {

  retrievedItems: ItemDetails[] = [];
  error: string;
  fetChMode: boolean = true;
  searchMode: boolean = false;
  groupName: string;
  individualTransactions = {};
  toBePaidInfo = [];
  constructor(private purchaseService: PurchaseDetailsService,
    private itemService: ItemsService, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private filterService: FilterService,
    private coreService: CoreLogicService) {

  }

  ngOnInit(): void {
   this.authService.errorSub.subscribe((errorMessage) => {
     this.error = errorMessage;
   });
   this.route.params.subscribe((data) => {
      this.groupName = data['id'];
      this.onFetchData();
   });
  }

  sortedList() {
    if(!this.filterService.name || this.filterService.name.trim() === '') {
      return this.filterService.sortPurchaseDetails(this.retrievedItems);
    } else {
      return this.filterService.sortPurchaseDetails(this.filterService.matchSearchedData(this.retrievedItems));
    }
  }

  onDeleteData(key: string) {
    const isOkay = confirm("Do you really want to delete this entry ?");
    if(isOkay) {
      this.itemService.deleteEntry(this.groupName, key)
      .subscribe((data)=> {
        this.onFetchData();
      });
    }
  };


  populateIndividualTransaction() {
    this.individualTransactions = [];
    for(let item of this.retrievedItems) {
      if(item.multiPerson) {
        const keys = Object.keys(item.individualTransaction);
        for(let key of keys) {
          if(this.individualTransactions[item.key]) {
            this.individualTransactions[item.key].push(key + ': ' + item.individualTransaction[key]);
          } else {
            this.individualTransactions[item.key] = [key + ': ' + item.individualTransaction[key]];
          }
        }
      }
    }
  }

  onFetchData() {
    this.itemService.fetchData(this.groupName)
    .subscribe((items)=>{
      this.purchaseService.populatePurchaseItems(items);
      this.retrievedItems = items;
      this.populateIndividualTransaction();
      this.fetChMode = false;
      this.coreService.setItemDetails(this.retrievedItems, this.groupName);
      this.coreService.getToBepaidInfoSubj.subscribe(info => {
        this.toBePaidInfo = info;
      });
    }, (errorMessage: string) => {
      this.error = errorMessage;
      this.fetChMode = false;
    });
  };

  onModifyEntry(key: string) {
    this.router.navigate(['purchase-form/' + this.groupName], {queryParams: {itemKey: key}});
  };

  // onClickItem(index: number) {
  //   this.router.navigate([index], {relativeTo: this.route});
  // }

}
