import { Component, OnInit } from '@angular/core';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { ItemsService } from '../items.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../app-auth/auth.service';
import { FilterService } from '../filter-component/filter.service';
import { CoreLogicService } from '../core-logic.service';
import { NgForm } from '@angular/forms';
import { StatusCodes } from 'http-status-codes';

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

  onDeleteData(item) {
    const isOkay = confirm("Do you really want to delete this entry ?");
    if(isOkay) {
      // this.itemService.deleteEntry(this.groupName, key)
      // .subscribe((data)=> {
      //   this.onFetchData();
      // });

      const transactionId = item._id;
      const groupId = item.group;

      this.itemService.deleteEntryFromNode(groupId, transactionId)
      .subscribe((data) => {
        // console.log(data);
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
    // this.itemService.fetchData(this.groupName)
    // .subscribe((items)=>{
    //   this.purchaseService.populatePurchaseItems(items);
    //   this.retrievedItems = items;
    //   this.populateIndividualTransaction();
    //   this.fetChMode = false;
    //   this.coreService.setItemDetails(this.retrievedItems, this.groupName);
    //   this.coreService.getToBepaidInfoSubj.subscribe(info => {
    //     this.toBePaidInfo = info;
    //   });
    // }, (errorMessage: string) => {
    //   this.error = errorMessage;
    //   this.fetChMode = false;
    // });


    this.itemService.fetchDataFromNode(this.groupName)
      .subscribe((itemsInfo) => {
        this.purchaseService.populatePurchaseItems(itemsInfo.items);
        this.retrievedItems = itemsInfo.items;
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

  onSettleDebt(paidInfo: {sender: string, receiver: string, amount: number}, index: number) {
     let form:  ItemDetails = {
       amount : paidInfo.amount,
       date : new Date().toISOString().split('T')[0],
       item: 'Debt Settle',
       key: this.groupName,
       multiPerson: null,
       person: paidInfo.sender,
       personsDistributedAmounts: [{
         amountOfEachPersons: paidInfo.amount,
         personsName: paidInfo.receiver
       }]
     };
    this.itemService.pushItemsToNode(this.groupName, form)
      .subscribe((response) => {
        // if (response.status === StatusCodes.OK) {
        //   this.onFetchData();
        // }
        if(response) {
          this.onFetchData();
        }
      }), (errorMessage: string) => {
        this.purchaseService.setError(errorMessage);
      };
     //this.toBePaidInfo.splice(index, 1);
  }

  onModifyEntry(key: string) {
    this.router.navigate(['purchase-form/' + this.groupName], {queryParams: {itemKey: key}});
  };

  onModifyEntryFromNode(transId: string) {
    this.router.navigate(['purchase-form/' + this.groupName], { queryParams: { itemKey: transId } });
  };

  // onClickItem(index: number) {
  //   this.router.navigate([index], {relativeTo: this.route});
  // }

}
