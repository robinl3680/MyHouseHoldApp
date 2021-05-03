import { Injectable } from '@angular/core';
import { ItemDetails } from '../items.model';

enum Options {
    amount = 'Amount spent',
    name = 'Name of person',
    date = 'Date of Purchase'
}

@Injectable({
    providedIn: 'root'
})

export class FilterService {
    
    option: string = 'date';
    direction: string = 'Descending';
    name: string = null;
    isSearchMode: boolean = false;
    setDirectionandOption(option, direction) {
        switch(option) {
            case Options.amount:
                this.option = 'amount'
                break;
            case Options.name:
                this.option = 'person'
                break;
            case Options.date:
                this.option = 'date'
                break;
        }
        this.direction = direction;
    }
    
    sortPurchaseDetails( retrievedItems: ItemDetails[] ) {
        let sortedArray:ItemDetails[] = [];
        sortedArray = this.sortData( retrievedItems );
        return sortedArray;
    }

    sortData(retrievedItems: ItemDetails[]) {
        return retrievedItems.sort((a, b) => {
            switch(this.direction) {
                case 'Ascending':
                    if(a[this.option] > b[this.option]) {
                        return 1;
                    } else {
                        return -1;
                    }
                case 'Descending':
                    if(a[this.option] < b[this.option]) {
                        return 1;
                    } else {
                        return -1;
                    }
            }
        });
    }

    matchSearchedData(retrievedItems: ItemDetails[]) {
       if(this.name) {
           let returnArr = [];
            for(let index in retrievedItems) {
                if(!retrievedItems[index].multiPerson) {
                    if(this.name.trim().toLowerCase() === retrievedItems[index].person.toLowerCase()) {
                        returnArr.push(retrievedItems[index]);
                    }
                } else {
                    let keys = Object.keys(retrievedItems[index]);
                    keys = keys.map(key => {
                        return key.toLowerCase();
                    });
                    if(keys.indexOf(this.name.toLowerCase()) > -1) {
                        returnArr.push(retrievedItems[index]);
                    }
                }
            }
            return returnArr;
       } else {
           return retrievedItems;
       }
    }

}