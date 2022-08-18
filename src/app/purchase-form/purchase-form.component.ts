import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter, Pipe } from '@angular/core';
import { Person } from '../person.model';
import { NgForm } from '@angular/forms';
import { ItemsService } from '../items.service';
import { PersonService } from '../person.service';
import { PurchaseDetailsService } from '../purchase-details.service';
import { StatusCodes } from 'http-status-codes';
import { ActivatedRoute, Data } from '@angular/router';
import { AuthService } from '../app-auth/auth.service';
import { ItemDetails } from '../items.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css'],
  providers:[DatePipe]
})
export class PurchaseFormComponent implements OnInit {
 
  itemCategories: string[] = [];
  persons: Person[] = [];
  isSuccess = false;
  enableClear = true;
  error: string;
  id: string;
  itemType: string;
  formData: ItemDetails;
  multiSelect = false;
  multiSelectCheckBoxInfo = {};
  disableSubmitOnMultiSelect = false;
  totalCost = 0;
  individualTransactions = {};
  onceModified = false;

  groupName: string;
  @ViewChild('form') form: NgForm;

  constructor(private itemService: ItemsService, 
    private personService: PersonService, 
    private purchaseService: PurchaseDetailsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.id = params['itemKey'];
      this.formData = this.purchaseService.onModifyEntry(this.id);
      if (this.formData) {
        this.itemType = this.formData.item;
        if(this.formData.multiPerson) {
          this.multiSelect = true;
        }
      }
    })

    this.route.params.subscribe((data: Data) => {
      this.groupName = data['id'];
      this.itemService.accessItems(this.groupName)
        .subscribe((items) => {
          this.itemCategories = items.itemArray;
        });

      // this.personService.fetchPersonDetails(this.groupName)
      //   .subscribe((persons: Person[]) => {
      //     this.persons = persons;
      //     this.setMultiSelectCheckBoxInfo();
      //   });

      this.personService.fetchPersonDetailsFromNode(this.groupName)
        .subscribe((response: { message: string, members: Person[]}) => {
          this.persons = response.members;
          // console.log(this.persons);
          this.setMultiSelectCheckBoxInfo();
        });
       
      this.onFetchData();
    });
 
    if (this.id) {
      setTimeout(() => {
        if (this.formData) {
          this.form.value.personsDistributedAmounts='';
          this.itemService.eachPersonsDeatils.next(this.formData);
          if(!this.multiSelect) {
            delete this.formData.individualTransaction;
            this.formData.date = this.datePipe.transform(this.formData.date, 'yyyy-MM-dd');
            this.form.setValue(this.formData);
          } else {
            this.setIndividualTransactionOnModify();
          }
        } else {
          this.error = "Data can't be loaded!!";
        }
      });
    }

    this.authService.errorSub.subscribe((errorMessage)=>{
      this.error = errorMessage;
    });
    
  };

  setMultiSelectCheckBoxInfo() {
    for(const person of this.persons) {
      this.multiSelectCheckBoxInfo[person.name] = true;
    }
    if(this.id && this.formData.multiPerson) {
      this.onModelChangeMultiPeopleEachValueEntered();
    }
  }

  setIndividualTransactionOnModify() {
    this.form.value.person = '';
    for(let key in this.formData.individualTransaction) {
      this.form.value[key] = '';
      this.individualTransactions[key] = this.formData.individualTransaction[key];
      this.multiSelectCheckBoxInfo[key] = true;
    }
    delete this.formData.person;
    delete this.formData.individualTransaction;
    this.form.setValue(this.formData);
  }

  onFetchData() {
    this.itemService.fetchData(this.groupName)
    .subscribe((items) => {
      this.purchaseService.populatePurchaseItems(items);
    }, (errorMessage: string) => {
      this.purchaseService.setError(errorMessage);
    });
  }

  onSubmitDetails(form: NgForm) {
    form.value.personsDistributedAmounts = this.purchaseService.getIndividualPurchaseDetails();
    if(this.multiSelect) {
      let individualTransactions = {};
      for(let person of this.persons) {
        if(this.form.value[person.name]) {
          form.value.multiPerson = true;
          individualTransactions[person.name] = form.value[person.name];
        }
      }
      form.value.individualTransaction = individualTransactions;
    }
    if(!this.id) {
      this.pushDetailsToServer(form); 
    } else {
      // this.itemService.deleteEntry(this.groupName, this.id)
      // .subscribe(()=>{
      //   this.pushDetailsToServer(form);
      // });

      this.itemService.modifyTransactionNode(this.groupName, this.id, form.value)
        .subscribe((data) => {
         if(data) {
           this.onFetchData();
           this.resetForm();
           this.isSuccess = true;
         }
      });

    }
  };

  pushDetailsToServer(form: NgForm) {
    // this.itemService.pushItems(this.groupName, form.value)
    //   .subscribe((response) => {
    //        if(response.status === StatusCodes.OK) {
    //         this.onFetchData();
    //         this.resetForm();
    //         this.isSuccess = true;
    //        }
    //   }), (errorMessage: string) => {
    //     this.purchaseService.setError(errorMessage);
    //   }; 

    this.itemService.pushItemsToNode(this.groupName, form.value)
      .subscribe((response: { message: string, transaction: ItemDetails }) => {
        if(response.transaction) {
          //this.onFetchData();
          this.resetForm();
          this.isSuccess = true;
        }
        // console.log(response);
      }), (errorMessage: string) => {
        this.purchaseService.setError(errorMessage);
      };
  };

  onModelChange() {
    this.isSuccess = false;
    this.enableClear = true;
  };

  onModelChangeAmount() {
    this.onModelChange();
    if(this.id && !this.onceModified) {
      this.personService.costEntered.next(this.formData);
      this.onceModified = true;
    } else {
      this.personService.costEntered.next(this.form.value);
    }
    if(this.multiSelect) {
      this.onModelChangeMultiPeopleEachValueEntered();
    }
  }

  onModelChangeItemCombo() {
    this.isSuccess = false;
    this.enableClear = true;
    if (!this.id) {
      this.itemType = this.form.value['item'];
    }
  };

  onMultiSelectChanged() {
    const self = this;
    this.multiSelect = this.form.controls["multiPerson"].value;
    this.disableSubmitOnMultiSelect = this.form.controls["multiPerson"].value;
    if(this.id) {
      for (const key in this.individualTransactions) {
        this.form.value[key] = this.individualTransactions[key];
        this.multiSelectCheckBoxInfo[key] = true;
      }
    }
  }

  onModelChangeIndividualCheck() {
    for(const key in this.individualTransactions) {
      if(!this.multiSelectCheckBoxInfo[key]) {
        this.individualTransactions[key] = 0;
      }
    }
    this.onModelChangeMultiPeopleEachValueEntered();
  }

  onModelChangeMultiPeopleEachValueEntered() {
    this.totalCost = 0;
    for(let person of this.persons) {
      if(this.multiSelectCheckBoxInfo[person.name]) {
        let cost = this.id ? ( +this.individualTransactions[person.name] ? +this.individualTransactions[person.name] : 0 ) : +this.form.value[person.name];
        this.totalCost += cost;
      }
    }
    if(this.totalCost === this.form.value['amount']) {
      this.disableSubmitOnMultiSelect = false;
    } else {
      this.disableSubmitOnMultiSelect = true;
    }
  }

  resetForm(isClear?: boolean) {
    if(this.form) {
      if(isClear) {
        this.form.reset();
        this.enableClear = false;
      } else {
        this.form.reset({
          item: 'Vegetables'
        });
      }
    }
  };
}
