import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { ItemDetails } from './items.model';
import { throwError } from 'rxjs';
import { AuthService } from './app-auth/auth.service';
import { PurchaseDetailsService } from './purchase-details.service';

@Injectable({
    providedIn: "root"
})
export class ItemsService {

    constructor(private http: HttpClient, private authService: AuthService,
        private purchaseService: PurchaseDetailsService) {

    }
    
    accessItems() {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/items.json')
                .pipe(
                map((items) => {
                    let itemArray: string[] = [];
                    for(const key in items) {
                        if(items.hasOwnProperty(key)) {
                            itemArray = items[key].split(',');
                        }
                    }
                    return itemArray;
                })
        );
    }

    pushItems(item: ItemDetails) {
        return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/dailyData.json', item,
        {
            observe: 'response'
        })
        .pipe(catchError((errorResponse) => {
            return this.authService.handleError(errorResponse, this.authService.errorSub);
        }));
    }

    fetchData() {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/dailyData.json')
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

    deleteEntry(key: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/dailyData/' + key + '.json' );
    }
}