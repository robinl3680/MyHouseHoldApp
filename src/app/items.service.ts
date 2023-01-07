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
        // return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items.json')
        //         .pipe(
        //         map((items) => {
        //             let itemArray: string[] = [];
        //             let itemKey: string[] = [];
        //             for(const key in items) {
        //                 if(items.hasOwnProperty(key)) {
        //                     itemArray.push(items[key].itemName);
        //                     itemKey.push(key);
        //                 }
        //             }
        //             return {itemArray, itemKey};
        //         })
        // );

        return this.http
          .get(
            `https://householdapp-server.onrender.com/groups/getItems/${groupId}`
          )
          .pipe(
            map((itemsObj: { items: Array<string> }) => {
              let itemArray = itemsObj.items;
              return { itemArray };
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
    };

    pushItemsToNode(groupId: string, item: ItemDetails) {
        return this.http
          .post(
            'https://householdapp-server.onrender.com/transactions/newTransaction',
            {
              groupId: groupId,
              item: item,
            }
          )
          .pipe(
            catchError((errorResponse) => {
              return this.authService.handleError(
                errorResponse,
                this.authService.errorSub
              );
            })
          );
    };

    modifyTransactionNode(groupdId: string, transactionId: string, item: ItemDetails) {
        return this.http
          .post(
            `https://householdapp-server.onrender.com/transactions/modify/${transactionId}`,
            {
              groupdId: groupdId,
              item: item,
            }
          )
          .pipe(
            catchError((err) => {
              return this.authService.handleError(
                err,
                this.authService.errorSub
              );
            })
          );
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

    fetchDataFromNode(groupId: string) {
        return this.http
          .get(
            `https://householdapp-server.onrender.com/transactions/${groupId}/getTransactions`
          )
          .pipe(
            tap((itemsInfo: { message: string; items: ItemDetails[] }) => {
              this.purchaseService.populatePurchaseItems(itemsInfo.items);
            }),
            catchError((errorResponse) => {
              return this.authService.handleError(
                errorResponse,
                this.authService.errorSub
              );
            })
          );
    }

    deleteEntry(groupId: string, key: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/dailyData/' + key + '.json' );
    }

    deleteEntryFromNode(groupId: string, transactionId: string) {
        return this.http.delete(`https://householdapp-server.onrender.com/transactions/${groupId}:${transactionId}/delete`);
    }

    deleteItemEntry(groupId: string, itemId: string) {
        // return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items/' + itemId + '.json');

        return this.http.post(
          `https://householdapp-server.onrender.com/groups/deleteItem`,
          {
            groupId: groupId,
            item: itemId,
          }
        );
    }

    updateItemEntry(groupId: string, itemId: string, itemName: string) {
        // return this.http.patch('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items/' + itemId + '.json', {
        //     itemName: itemName
        // });

        return this.http.post(
          `https://householdapp-server.onrender.com/groups/updateItem`,
          {
            groupId: groupId,
            oldName: itemId,
            newName: itemName,
          }
        );
    }

}