import { Injectable } from '@angular/core';
import { ItemDetails } from './items.model';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: "root"
})
export class PurchaseDetailsService {

    private retrievedItems: ItemDetails[] = [];
    error: string;
    // onDetailedItemView: Subject<ItemDetails[]> = new Subject<ItemDetails[]>();
     
    populatePurchaseItems(items: ItemDetails[]) {
        this.retrievedItems = items;
    }

    getPurchasedItems() {
        return this.retrievedItems.slice();
    }

    setError(error: string) {
        this.error = error;
    }

    getError(): string {
        return this.error;
    }

    onModifyEntry(key: string): ItemDetails {
        for(const item of this.retrievedItems) {
            if(item.key === key) {
              return ({
                date: item.date,
                item: item.item,
                amount: item.amount,
                  person: item.person,
                //   details: item.details
              });
            }
        }
        return null;
    }

    onDetailedItemViewClick( type: string, label: string ) {
        let selectedData: ItemDetails[] = [];
        for( let item of this.retrievedItems ) {
            if( type === 'item' && item.item === label ) {
                selectedData.push( item );
            } else {
                if( type === 'person' && item.person === label ) {
                    selectedData.push( item );
                }
            }
        }
        return selectedData; 
    }
}