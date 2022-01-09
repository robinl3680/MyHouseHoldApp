import { Component, OnInit } from '@angular/core';
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
