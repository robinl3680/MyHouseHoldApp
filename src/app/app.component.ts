import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ItemsService } from './items.service';
import { NgForm } from '@angular/forms';
import { ItemDetails } from './items.model';
import { Person } from './person.model';
import { PersonService } from './person.service';
import { StatusCodes } from 'http-status-codes';
import { PurchaseDetailsService } from './purchase-details.service';
import { AuthService } from './app-auth/auth.service';
import { UserGroupService } from './handle-user-groups/handle-user-groups.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private groupService: UserGroupService) {

  }
 ngOnInit() {
   this.authService.autoLogin();
   this.groupService.autoLoadGroupId();
 }
}
