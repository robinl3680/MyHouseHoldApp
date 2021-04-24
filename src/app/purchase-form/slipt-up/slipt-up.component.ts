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
  personsDetails={};
  modefyData:ItemDetails;
  
  @Input() groupName: string;

  constructor(private personService: PersonService,private purchaseDetailsService:PurchaseDetailsService,
    private itemsService:ItemsService) {

  }

  ngOnInit() {
    this.itemsService.eachPersonsDeatils.subscribe((personsDetails)=>{
      this.modefyData=personsDetails;
    })
    this.personService.fetchPersonDetails(this.groupName)
      .subscribe((persons: Person[]) => {
        this.persons = persons;
        this.uncheckedBoxes = persons.length;
        if(this.uncheckedBoxes>0){
          for(let index in this.persons){
            if(this.modefyData.personsDistributedAmounts[index].personsName===this.persons[index].name){
              if(this.modefyData.personsDistributedAmounts[index].amountOfEachPersons!==0){
                this.checkBoxInfo[index] = true;
                this.individualSum=this.modefyData.personsDistributedAmounts[index].amountOfEachPersons;
              }else{
                this.checkBoxInfo[index] = false;
                this.individualSum=this.modefyData.personsDistributedAmounts[index].amountOfEachPersons;
              }
            }
            else {
              // sonarLint
            }
          }
         }
      });
    this.personService.costEntered.subscribe(x => {
      this.enteredCostByUser = x.amount;
      this.defaultDistrubuiteAmountEqualy(this.enteredCostByUser);
    });

  }
  

  defaultDistrubuiteAmountEqualy(amount) {
    for(let index in this.persons) {

      this.checkBoxInfo[index] = true;
    }

    if (amount) {
      this.individualSum = amount / this.uncheckedBoxes;
      this.pushPersonsIndividualDetails();
      return this.individualSum;
    } 
    
  }
  
  onModelChange(index, isChecked) {
    if(this.uncheckedBoxes !== undefined && !isChecked) {
      this.uncheckedBoxes--;
    } else {
      if(this.uncheckedBoxes !== undefined && isChecked ) {
        this.uncheckedBoxes++;
      }
    }
    this.checkBoxInfo[index] = isChecked;
    this.individualSum = this.enteredCostByUser / this.uncheckedBoxes; 
    this.pushPersonsIndividualDetails();
  }

  pushPersonsIndividualDetails(){
    let purchaseDetails=[];
    for(let index in this.persons){
      purchaseDetails.push(
        {
          personsName: this.persons[index].name, 
          amountOfEachPersons: this.checkBoxInfo[index] ? this.individualSum : 0
        }
      )
    }
    this.purchaseDetailsService.setIndividualPurchaseDetails(purchaseDetails);
  }
   
 }

