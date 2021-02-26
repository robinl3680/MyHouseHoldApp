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

    fetchPersonDetails() {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/persons.json')
        .pipe(
            map((personDetails) => {
                const persons: Person[] = [];
                for(const key in personDetails) {
                    persons.push({name: key, mobile: +personDetails[key]});
                }
                return persons;
            } 
        ));
    }
    
}