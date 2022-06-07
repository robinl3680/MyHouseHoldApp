import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PurchaseDetailsService } from './purchase-details.service';
import { ItemDetails } from './items.model';
import { ItemsService } from './items.service';

@Injectable({
    providedIn: 'root'
})
export class AppResolver implements Resolve<ItemDetails[]> {
    constructor(private purchaseService: PurchaseDetailsService, private itemService: ItemsService) {

    }
    resolve(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot) {
        const items = this.purchaseService.getPurchasedItems();
        if(items.length === 0) {
            return this.itemService.fetchData(route.params['id']);
        } else {
            return items;
        }
    }
}