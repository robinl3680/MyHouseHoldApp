import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Person } from './person.model';

@Injectable({
    providedIn: "root"
})
export class PersonService {
    constructor(private http: HttpClient) {

    }

    fetchPersonDetails(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/' + groupId + '/persons.json')
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
    
}