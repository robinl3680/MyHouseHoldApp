import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { ItemDetails, PersonsDistributedAmounts } from './items.model';
import { Subject, throwError } from 'rxjs';
import { AuthService } from './app-auth/auth.service';
import { PurchaseDetailsService } from './purchase-details.service';

@Injectable({
    providedIn: "root"
})
export class ItemsService {
    eachPersonsDeatils = new Subject<ItemDetails>();
    constructor(private http: HttpClient, private authService: AuthService,
        private purchaseService: PurchaseDetailsService) {

    }
    
    accessItems(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items.json')
                .pipe(
                map((items) => {
                    let itemArray: string[] = [];
                    let itemKey: string[] = [];
                    for(const key in items) {
                        if(items.hasOwnProperty(key)) {
                            itemArray.push(items[key].itemName);
                            itemKey.push(key);
                        }
                    }
                    return {itemArray, itemKey};
                })
        );
    }

    pushItems(groupId: string, item: ItemDetails) {
        return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/dailyData.json', item,
        {
            observe: 'response'
        })
        .pipe(catchError((errorResponse) => {
            return this.authService.handleError(errorResponse, this.authService.errorSub);
        }));
    }

    fetchData(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/dailyData.json')
                .pipe(
                map((itemsDetails) => {
                    let itemArray: ItemDetails[] = [];
                    for(const key in itemsDetails) {
                        if(itemsDetails.hasOwnProperty(key)) {
                            itemArray.push({...itemsDetails[key], key: key});
                        }
                    }
                    return itemArray;
                }),
                tap((items)=> {
                    this.purchaseService.populatePurchaseItems(items);
                }),
                catchError((errorResponse) => {
                   return this.authService.handleError(errorResponse, this.authService.errorSub);
                })
        );
    }

    deleteEntry(groupId: string, key: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/dailyData/' + key + '.json' );
    }

    deleteItemEntry(groupId: string, itemId: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items/' + itemId + '.json');
    }

    updateItemEntry(groupId: string, itemId: string, itemName: string) {
        return this.http.patch('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items/' + itemId + '.json', {
            itemName: itemName
        });
    }

}