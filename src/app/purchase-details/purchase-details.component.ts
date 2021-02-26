import { Component, OnInit } from '@angular/core';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { ItemsService } from '../items.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../app-auth/auth.service';
import { FilterService } from '../filter-component/filter.service';

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
  constructor(private purchaseService: PurchaseDetailsService,
    private itemService: ItemsService, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private filterService: FilterService) {

  }

  ngOnInit(): void {
   this.onFetchData();
   this.authService.errorSub.subscribe((errorMessage) => {
     this.error = errorMessage;
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
      this.itemService.deleteEntry(key)
      .subscribe((data)=> {
        this.onFetchData();
      });
    }
  };

  onFetchData() {
    this.itemService.fetchData()
    .subscribe((items)=>{
      this.purchaseService.populatePurchaseItems(items);
      this.retrievedItems = items;
      this.fetChMode = false;
    }, (errorMessage: string) => {
      this.error = errorMessage;
      this.fetChMode = false;
    });
  };

  onModifyEntry(key: string) {
    this.router.navigate(['purchase-form/', key]);
  };

  onClickItem(index: number) {
    this.router.navigate([index], {relativeTo: this.route});
  }

}
