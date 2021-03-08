import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../app-auth/auth.service';
import { UserGroupService } from '../handle-user-groups/handle-user-groups.service';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userSubscription: Subscription;
  groupSubscription: Subscription;
  groupName: string;
  isAuthenticated = false;
  constructor(private authService: AuthService, private groupService: UserGroupService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe((userData)=>{
      this.isAuthenticated = userData ? true : false;
    });
    this.groupSubscription = this.groupService.groupSubject.subscribe((data) => {
      this.groupName = data;
    });
  }

  onLogOut() {
    this.authService.onLogOut();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.groupSubscription.unsubscribe();
  }

}
