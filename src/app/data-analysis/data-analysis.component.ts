import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import * as Chart from 'chart.js';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { Router, ActivatedRoute } from '@angular/router';
import { title } from 'process';
import { Label } from 'ng2-charts';
import { FilterService } from '../filter-component/filter.service';

@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.css']
})
export class DataAnalysisComponent implements OnInit {

  constructor(private purchaseService: PurchaseDetailsService, 
    private router: Router,
    private route: ActivatedRoute,
    private filterService: FilterService) { 

  }

  public itemChartLabels: string[] = [];
  public itemChartData: number[] = [];
  public personChartLabels: string[] = [];
  public personChartData: number[] = [];
  public lineChartData: Chart.ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];

  public pieChartType = 'doughnut';
  public itemChartOptions = {
    'onClick' : this.handleOnClickLegendForItemChart.bind(this),
    cutoutPercentage: 0
  };
  public personChartOptions = {
    'onClick': this.handleOnClickLegendForPersonChart.bind(this),
    cutoutPercentage: 0
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
    Chart.defaults.scale.gridLines.drawOnChartArea = false;
    this.itemDetails = this.purchaseService.getPurchasedItems();
    this.populateChartData();
  }

  private populateChartData() {
    let itemDataMap = {};
    let personDataMap = {};
    this.getChartData(itemDataMap, personDataMap);
    let lineDataset = this.getLineChartData();
    this.lineChartLabels = lineDataset.labels;
    this.populateLineChartData(lineDataset);
    for (let key in itemDataMap) {
      this.itemChartLabels.push(key);
      this.itemChartData.push(itemDataMap[key]);
    }
    for (let key in personDataMap) {
      this.personChartLabels.push(key);
      this.personChartData.push(personDataMap[key]);
    }
  }

  private getLineChartData() {
    this.filterService.setDirectionandOption('Date of Purchase', 'Ascending');
    let filteredData = this.filterService.sortData(this.itemDetails.slice());
    let labels = [];
    let data = {};
    for (let item of filteredData) {
      if (labels.indexOf(item.date) === -1) {
        labels.push(item.date);
      }
    }

    for (let item of filteredData) {
      for (let label of labels) {
        if (item.date === label) {
          if (data[item.item] && data[item.item][label]) {
            data[item.item][label].push(item.amount);
          } else {
            if (!data[item.item]) {
              data[item.item] = [];
            }
            data[item.item][label] = [item.amount];
          }
        } else {
          if (!(data[item.item] && data[item.item][label])) {
            if (!data[item.item]) {
              data[item.item] = [];
            }
            data[item.item][label] = [0];
          }
        }
      }
    }
    return { data: data, labels: labels };
  }

  private populateLineChartData(lineDataset) {
    for (let key in lineDataset.data) {
      let tempData = [];
      for (let date in lineDataset.data[key]) {
        if (lineDataset.data[key][date].length > 1) {
          tempData.push(lineDataset.data[key][date].reduce((a, b) => a + b, 0));
        } else {
          tempData.push(...lineDataset.data[key][date]);
        }
      }
      let tempObj = {};
      tempObj['data'] = tempData;
      tempObj['label'] = key;
      this.lineChartData.push(tempObj);
    }
  }

  private getChartData(itemDataMap, personDataMap) {
    for (let item of this.itemDetails) {
      if (itemDataMap[item.item]) {
        itemDataMap[item.item] += item.amount;
      } else {
        itemDataMap[item.item] = item.amount;
      }
      if (personDataMap[item.person]) {
        personDataMap[item.person] += item.amount;
      } else {
        personDataMap[item.person] = item.amount;
      }
    }
  }

  private handleOnClickLegendForItemChart(evt, data) {
    if(data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'item';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: {item: label} });
    }
  }

  private handleOnClickLegendForPersonChart(evt, data) {
    if(data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'person';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: {person: label} });
    }
  }

  private commonHandlingForLegendClick(data): string {
    const clickedIndex = data[0]._index;
    const label = data[0]._chart.data.labels[clickedIndex];
    return label;
  }

}
