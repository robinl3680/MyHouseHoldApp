import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthService } from './app-auth/auth.service';
import { DummyState } from './app-auth/Store/states/dummy.state';
import { UserGroupService } from './handle-user-groups/handle-user-groups.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title;
  constructor(private authService: AuthService, private groupService: UserGroupService, private store: Store) {

  }
 ngOnInit() {
   this.title = 'MyHouseHoldApp';
   this.authService.autoLogin();
   this.groupService.autoLoadGroupId();
   this.store.select(DummyState.getData).subscribe((d) => 
    console.log(d)
   );
 }
}
