import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import * as Chart from 'chart.js';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { Router, ActivatedRoute } from '@angular/router';
import { title } from 'process';

@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.css']
})
export class DataAnalysisComponent implements OnInit {

  constructor(private purchaseService: PurchaseDetailsService, 
    private router: Router,
    private route: ActivatedRoute) { 

  }

  public itemChartLabels: string[] = [];
  public itemChartData: number[] = [];
  public personChartLabels: string[] = [];
  public personChartData: number[] = [];
  // public pieChartDataSets: Chart.ChartDataSets[] = [];
  // public pieChartDataSet: {data: number[], label: string} = {data: [], label: ''};
  public pieChartType = 'doughnut';
  public itemChartOptions = {
    'onClick' : this.handleOnClickLegendForItemChart.bind(this),
    cutoutPercentage: 40
  };
  public personChartOptions = {
    'onClick': this.handleOnClickLegendForPersonChart.bind(this),
    cutoutPercentage: 40
  };
  public backgroundColor = ['rgba(0, 0, 225, 1)', 'rgba(255, 0, 0, 1)', 'rgba(51, 204, 0, 1)', 'rgba(204, 0, 204, 1)', 'rgba(255, 153, 0, 1)', 'rgba(255, 0, 102, 1)'];
  private itemDetails: ItemDetails[] = [];
  public pieChartColors = [
    {
      backgroundColor: this.backgroundColor,
    },
  ];

  public chartMode: string = '';

  ngOnInit(): void {
    this.itemDetails = this.purchaseService.getPurchasedItems();
    //this.populateLabels();
    this.populateChartData();
  }

  private populateChartData() {
    let itemDataMap = { };
    let personDataMap = { };
    for( let item of this.itemDetails ) {
      if( itemDataMap[item.item] ) {
        itemDataMap[item.item] += item.amount;
      } else {
        itemDataMap[item.item] = item.amount;
      }
      if( personDataMap[item.person] ) {
        personDataMap[item.person] += item.amount;
      } else {
        personDataMap[item.person] = item.amount;
      }
    }
    for( let key in itemDataMap ) {
      this.itemChartLabels.push(key);
      this.itemChartData.push(itemDataMap[key]);
    }
    for( let key in personDataMap ) {
      this.personChartLabels.push(key);
      this.personChartData.push(personDataMap[key]);
    }
    //this.pieChartDataSet.data = this.pieChartData;
    //this.pieChartDataSet.label= 'Cost analysis';
    //this.pieChartDataSets.push(this.pieChartDataSet);
  }

  handleOnClickLegendForItemChart(evt, data) {
    if(data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'item';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: {item: label} });
    }
  }

  handleOnClickLegendForPersonChart(evt, data) {
    if(data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'person';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: {person: label} });
    }
  }

  commonHandlingForLegendClick(data): string {
    const clickedIndex = data[0]._index;
    const label = data[0]._chart.data.labels[clickedIndex];
    return label;
  }

}
