import { Component, OnInit } from '@angular/core';
import { ItemDetails } from 'src/app/items.model';
import { PurchaseDetailsService } from 'src/app/purchase-details.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detailed-data-view',
  templateUrl: './detailed-data-view.component.html',
  styleUrls: ['./detailed-data-view.component.css']
})
export class DetailedDataViewComponent implements OnInit {

  detailedViewData: ItemDetails[] = [];
  individualTransactions = {};
  constructor(private purchaseService: PurchaseDetailsService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => {
      this.detailedViewData = this.purchaseService.onDetailedItemViewClick(Object.keys(data)[0], Object.values(data)[0]);
      this.setIndividualTransactions(this.detailedViewData);
    });
  }

  setIndividualTransactions(items: ItemDetails[]) {
    this.individualTransactions = {};
    for(const item of items) {
      if(item.multiPerson) {
        for(const key in item.individualTransaction) {
          if(this.individualTransactions[item.key]) {
            this.individualTransactions[item.key].push( key + ': ' + item.individualTransaction[key]);
          } else {
            this.individualTransactions[item.key] = [key + ': ' + item.individualTransaction[key]];
          }
        }
      }
    }
  }

}
