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
  constructor(private purchaseService: PurchaseDetailsService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => {
      this.detailedViewData = this.purchaseService.onDetailedItemViewClick(Object.keys(data)[0], Object.values(data)[0]);
    });
  }

}
