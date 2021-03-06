import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { PurchaseDetailsService } from '../purchase-details.service';
import { ItemDetails } from '../items.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Label } from 'ng2-charts';
import { FilterService } from '../filter-component/filter.service';
import { map } from 'rxjs/operators';

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
  error: string;
  public itemChartLabels: string[] = [];
  public itemChartData: number[] = [];
  public personChartLabels: string[] = [];
  public personChartData: number[] = [];
  public lineChartData: Chart.ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];

  selectedFutureDateFlag: boolean = false;
  invalidDatesErrorFlag: boolean;
  getHistoryDate: boolean = false;
  public transactionFromDate: Date;
  public transactionToDate: Date;

  public pieChartType = 'doughnut';
  public itemChartOptions = {
    'onClick': this.handleOnClickLegendForItemChart.bind(this),
    cutoutPercentage: 0
  };
  public personChartOptions = {
    'onClick': this.handleOnClickLegendForPersonChart.bind(this),
    cutoutPercentage: 0
  };

  public lineChartOptions = {
    tooltips: {
      callbacks: {
        label: this.lineChartCallback.bind(this),
        // footer: function (tooltipItems, data) {
        //   return ['new line', 'another line'];
        // }
      },

    }
  }

  public backgroundColor = ['rgba(0, 0, 225, 1)', 'rgba(255, 0, 0, 1)', 'rgba(51, 204, 0, 1)', 'rgba(204, 0, 204, 1)', 'rgba(255, 153, 0, 1)', 'rgba(255, 0, 102, 1)'];
  private itemDetails: ItemDetails[] = [];
  public pieChartColors = [
    {
      backgroundColor: this.backgroundColor,
    },
  ];

  public chartMode: string = '';
  private sortedDataSet: ItemDetails[];

  ngOnInit(): void {
    Chart.defaults.scale.gridLines.drawOnChartArea = false;
    this.itemDetails = this.purchaseService.getPurchasedItems();
    this.populateChartData();
  }

  private populateChartData(chartDataOndateRange?) {
    let itemDataMap = {};
    let personDataMap = {};
    let lineDataset;

    if (chartDataOndateRange) {
      this.getChartData(itemDataMap, personDataMap, chartDataOndateRange);
      lineDataset = this.getLineChartData(chartDataOndateRange);
    } else {
      this.getChartData(itemDataMap, personDataMap);
      lineDataset = this.getLineChartData();
    }
    this.lineChartLabels = lineDataset.labels;
    this.populateLineChartData(lineDataset);
    if (this.getHistoryDate === false) {
      for (let key in itemDataMap) {
        this.itemChartLabels.push(key);
        this.itemChartData.push(itemDataMap[key]);
      }
      for (let key in personDataMap) {
        this.personChartLabels.push(key);
        this.personChartData.push(personDataMap[key]);
      }
    }
  }

  private getLineChartData(dataFromDateRange?: ItemDetails[]) {
    let filteredData;
    this.filterService.setDirectionandOption('Date of Purchase', 'Ascending');
    if (this.getHistoryDate === false) {
      filteredData = this.filterService.sortData(this.itemDetails.slice());
      this.sortedDataSet = filteredData;
    } else {
      filteredData = this.filterService.sortData(dataFromDateRange.slice());
      this.sortedDataSet = filteredData;
    }

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
    this.lineChartData = [];
    let chartColorIndex = 0;
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
      if(this.backgroundColor[chartColorIndex]){
        tempObj['borderColor'] = this.backgroundColor[chartColorIndex++];
      }
      tempObj['fill'] = false;
      this.lineChartData.push(tempObj);
    }
    if (this.lineChartData.length === 0) {
      this.error = "No Transactions";
    }
  }

  private getChartData(itemDataMap, personDataMap, chartDataOndateRange?: ItemDetails[]) {
    let sampleOfItemDetails;
    if (this.getHistoryDate !== false) {
      sampleOfItemDetails = chartDataOndateRange.slice();
    } else {
      sampleOfItemDetails = this.itemDetails.slice();
    }
    for (let item of sampleOfItemDetails) {
      if (itemDataMap[item.item]) {
        itemDataMap[item.item] += item.amount;
      } else {
        itemDataMap[item.item] = item.amount;
      }
      if (item.multiPerson) {
        for (let key in item.individualTransaction) {
          if (personDataMap[key]) {
            personDataMap[key] += +item.individualTransaction[key];
          } else {
            personDataMap[key] = +item.individualTransaction[key];
          }
        }
      } else {
        if (personDataMap[item.person]) {
          personDataMap[item.person] += item.amount;
        } else {
          personDataMap[item.person] = item.amount;
        }
      }
    }
  }

  private handleOnClickLegendForItemChart(evt, data) {
    if (data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'item';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: { item: label } });
    }
  }

  private handleOnClickLegendForPersonChart(evt, data) {
    if (data && data[0]) {
      const label = this.commonHandlingForLegendClick(data);
      this.chartMode = 'person';
      this.router.navigate(['detailed-data-view'], { relativeTo: this.route, queryParams: { person: label } });
    }
  }

  private commonHandlingForLegendClick(data): string {
    const clickedIndex = data[0]._index;
    const label = data[0]._chart.data.labels[clickedIndex];
    return label;
  }


  private findLabel(xLabel, yLabel, dataSetIndex) {
    let label = '';
    let labelAmount = 0;
    if (yLabel === 0) {
      return this.lineChartData[dataSetIndex].label + ' Cost : 0';
    } else {
      for (let item of this.sortedDataSet) {
        if (item.date === xLabel && this.lineChartData[dataSetIndex].label === item.item) {
          labelAmount += item.amount;
          if(label === '') {
            label = label + item.item + ' ' + 'Total Cost: ' + labelAmount + '\n';
          }
          if (item.multiPerson) {
            for (let p in item.individualTransaction) {
              label = label + p + ': ' + item.individualTransaction[p] + '\n';
            }
          } else {
            label = label + item.person + ': ' + item.amount + '\n';
          }
          if(labelAmount === +yLabel) {
            let tempLabel = label.split('\n');
            tempLabel[0] = item.item + ' ' + 'Total Cost: ' + labelAmount;
            label = tempLabel.join('\n');
            break;
          }
        }
      }
    }
    return label;
  }


  private getFooter(xLabel, yLabel) {
    let label = '';
    for (let item of this.sortedDataSet) {
      if (item.date === xLabel && item.amount === +yLabel) {
        label = label + item.item + ' ' + 'Total Cost: ' + item.amount + '\n';
        if (item.multiPerson) {
          for (let p in item.individualTransaction) {
            label = label + p + ': ' + item.individualTransaction[p] + '\n';
          }
        } else {
          label = label + item.person + ': ' + item.amount + '\n';
        }
      }
    }
  }


  private lineChartCallback(context) {
    let label = this.findLabel(context.xLabel, context.yLabel, context.datasetIndex);
    let labels = label.split('\n');
    return labels.length > 1 ? labels.splice(0, labels.length - 1) : labels;
  }

  getPreviousData() {
    this.getHistoryDate = true;
    this.invalidDatesErrorFlag = false;
    if (this.transactionToDate && this.transactionFromDate) {
      if (this.transactionToDate < this.transactionFromDate) {
        this.invalidDatesErrorFlag = true;
        this.error = "* Invalid Date "
        return;
      }
      let chartDataOndateRange: Array<ItemDetails> = [];
      for (let data of this.itemDetails) {
        if (data.date >= this.transactionFromDate && data.date <= this.transactionToDate) {
          chartDataOndateRange.push(data);
        }
      }
      this.populateChartData(chartDataOndateRange)
    }
  }

}
