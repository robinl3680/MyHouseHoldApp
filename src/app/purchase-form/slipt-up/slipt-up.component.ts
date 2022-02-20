import { Component, Input, OnInit } from '@angular/core';

import { ItemDetails } from 'src/app/items.model';
import { ItemsService } from 'src/app/items.service';
import { Person } from 'src/app/person.model';
import { PersonService } from 'src/app/person.service';
import { PurchaseDetailsService } from 'src/app/purchase-details.service';

@Component({
  selector: 'app-slipt-up',
  templateUrl: './slipt-up.component.html',
  styleUrls: ['./slipt-up.component.css']
})

export class SliptUpComponent implements OnInit {
  public personPaidAmountOfEachItem = [];
  checked = true;
  persons: Person[] = [];
  individualSum: number = 0;
  enteredCostByUser;
  error: string;
  uncheckedBoxes: number;
  checkBoxInfo = {};
  personsDetails = {};
  modefyData:ItemDetails;
  
  @Input() groupName: string;

  constructor(private personService: PersonService, private purchaseDetailsService:PurchaseDetailsService,
    private itemsService:ItemsService) {

  }

  ngOnInit() {
    this.itemsService.eachPersonsDeatils.subscribe((personsDetails)=>{
      this.modefyData = personsDetails;
    });
    this.personService.fetchPersonDetailsFromNode(this.groupName)
      .subscribe((persons: { message: string, members: Person[]}) => {
        if(this.persons.length === 0) {
          this.persons = persons.members;
          this.uncheckedBoxes = persons.members.length;
          if (this.uncheckedBoxes > 0) {
            for (let index in this.persons) {
              if (this.modefyData && this.modefyData.personsDistributedAmounts) {
                this.populateCheckBoxInfo(this.modefyData.personsDistributedAmounts, index);
                this.defaultDistrubuiteAmountEqualy(this.modefyData.amount, this.modefyData.personsDistributedAmounts);
              } else{
                this.checkBoxInfo[index] = true;
              }
            }
          }
        }
      });

    this.personService.costEntered.subscribe(x => {
      this.enteredCostByUser = x.amount;
      this.defaultDistrubuiteAmountEqualy(this.enteredCostByUser, x.personsDistributedAmounts);
    });

  }
  
  populateCheckBoxInfo(contributedPeople, index) {
    let contributedPeopleNames = contributedPeople.map(person => {
      return person.personsName;
    });
    if (contributedPeopleNames.indexOf(this.persons[index].name) > -1 ) {
      this.checkBoxInfo[index] = true;
    } else {
      this.checkBoxInfo[index] = false;
    }
  }

  defaultDistrubuiteAmountEqualy(amount, contributedPeople?) {
    if(this.persons.length > 0) {
      for (let index in this.persons) {
        if (contributedPeople) {
          this.populateCheckBoxInfo(contributedPeople, index);
        }
      }
      amount = amount === null ? 0 : amount;
      if (amount !== null) {
        let checkedCount = Object.values(this.checkBoxInfo).filter(x => x === true).length;
        this.individualSum = amount / checkedCount;
        this.pushPersonsIndividualDetails();
        return this.individualSum;
      } 
    }
  }
  
  onModelChange(index, isChecked) {
    this.checkBoxInfo[index] = isChecked;
    let checkedCount = Object.values(this.checkBoxInfo).filter(x => x === true).length;
    this.individualSum = this.enteredCostByUser / checkedCount; 
    this.pushPersonsIndividualDetails();
  }

  pushPersonsIndividualDetails(){
    let purchaseDetails = [];
    for(let index in this.persons){
      if (this.checkBoxInfo[index]) {
        purchaseDetails.push(
          {
            personsName: this.persons[index].name,
            amountOfEachPersons: this.individualSum
          }
        )
      }
    }
    this.purchaseDetailsService.setIndividualPurchaseDetails(purchaseDetails);
  }
   
 }

