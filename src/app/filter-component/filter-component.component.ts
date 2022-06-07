import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FilterService } from './filter.service';

@Component({
  selector: 'app-filter-component',
  templateUrl: './filter-component.component.html',
  styleUrls: ['./filter-component.component.css']
})
export class FilterComponent implements OnInit, OnDestroy {

  filterOptions = ['Amount spent', 'Name of person', 'Date of Purchase'];
  selectedOption: string;
  searchResult: string;
  

  @ViewChild('filterForm', {static: false} ) filterForm: NgForm;
  constructor( private filterService: FilterService ) {

  }

  ngOnInit(): void {
    
  }
  ngOnDestroy(): void {
    this.filterService.name = '';
  }

  filterAscend() {
    this.selectedOption = this.filterForm.value.filterOptions;
    this.filterService.setDirectionandOption(this.selectedOption,'Ascending');
  }

  filterDescend() {
    this.selectedOption = this.filterForm.value.filterOptions;
    this.filterService.setDirectionandOption(this.selectedOption,'Descending');
  }

  onSearch() {
    this.filterService.name = this.searchResult;
  }

  onModelChange() {
    if(this.searchResult.trim() === ''){
      this.filterService.name = null;
    }
  }

}
