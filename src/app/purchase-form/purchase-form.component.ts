import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Person } from '../person.model';
import { NgForm } from '@angular/forms';
import { ItemsService } from '../items.service';
import { PersonService } from '../person.service';
import { PurchaseDetailsService } from '../purchase-details.service';
import { StatusCodes } from 'http-status-codes';
import { ActivatedRoute, Data } from '@angular/router';
import { AuthService } from '../app-auth/auth.service';
import { ItemDetails } from '../items.model';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css']
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

  groupName: string;
  @ViewChild('form') form: NgForm;

  constructor(private itemService: ItemsService, 
    private personService: PersonService, 
    private purchaseService: PurchaseDetailsService,
    private route: ActivatedRoute,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.id = params['itemKey'];
      this.formData = this.purchaseService.onModifyEntry(this.id);
      if (this.formData) {
        this.itemType = this.formData.item;
      }
    })

    this.route.params.subscribe((data: Data) => {
      this.groupName = data['id'];
      this.itemService.accessItems(this.groupName)
        .subscribe((items) => {
          this.itemCategories = items;
        });

      this.personService.fetchPersonDetails(this.groupName)
        .subscribe((persons: Person[]) => {
          this.persons = persons;
        });
       
      this.onFetchData();
    });
 
    if (this.id) {
      setTimeout(() => {
        if (this.formData) {
          this.form.value.personsDistributedAmounts='';
          this.itemService.eachPersonsDeatils.next(this.formData);
          this.form.setValue(this.formData);
        } else {
          this.error = "Data can't be loaded!!";
        }
      });
    }

    this.authService.errorSub.subscribe((errorMessage)=>{
      this.error = errorMessage;
    });
    
  };

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
      this.itemService.deleteEntry(this.groupName, this.id)
      .subscribe(()=>{
        this.pushDetailsToServer(form);
      });
    }
  };

  pushDetailsToServer(form: NgForm) {
    this.itemService.pushItems(this.groupName, form.value)
      .subscribe((response) => {
           if(response.status === StatusCodes.OK) {
            this.onFetchData();
            this.resetForm();
            this.isSuccess = true;
           }
      }), (errorMessage: string) => {
        this.purchaseService.setError(errorMessage);
      };    
  };

  onModelChange() {
    this.isSuccess = false;
    this.enableClear = true;
    //this.distrubuiteAmountEqualy();
  };

  onModelChangeAmount() {
    this.onModelChange();
    if(this.id) {
      this.personService.costEntered.next(this.formData);
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

  onMultiSelectOption(checked) {
    this.multiSelect = checked;
    this.disableSubmitOnMultiSelect = checked;
    this.multiSelectCheckBoxInfo = {};
  }

  onModelChangeMultiSelectEachCheck(name, checked) {
    this.multiSelectCheckBoxInfo[name] = checked;
  }

  onModelChangeMultiPeopleEachValueEntered() {
    this.totalCost = 0;
    for(let person of this.persons) {
      if(this.multiSelectCheckBoxInfo[person.name]) {
        let cost = +this.form.value[person.name];
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
