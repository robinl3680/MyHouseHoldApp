import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AppAuthHelper {
 constructor(private http: HttpClient, private authS) {

 }
   
}