import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Person } from './person.model';
import { ItemDetails } from './items.model';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
    providedIn: "root"
})
export class PersonService {
    costEntered = new Subject<ItemDetails>();
    constructor(private http: HttpClient) {

    }

    fetchPersonDetails(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/persons.json')
        .pipe(
            map((personDetails) => {
                const persons: Person[] = [];
                for(const key in personDetails) {
                    persons.push({ name: personDetails[key].userName, mobile: +personDetails[key].mobileNumber});
                }
                return persons;
            } 
        ));
    }

    fetchPersonDetailsFromNode(groupId: string) {
        return this.http.get(
          `https://householdapp-server.onrender.com/groups/getMembers/${groupId}`
        );
    }
    
}