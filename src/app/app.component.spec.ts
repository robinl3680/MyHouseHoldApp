import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { AuthService } from './app-auth/auth.service';
import { SetData } from './app-auth/Store/actions/dummy.action';
import { DummyState } from './app-auth/Store/states/dummy.state';
import { AppComponent } from './app.component';
import { UserGroupService } from './handle-user-groups/handle-user-groups.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';


// class MockAuthService {

//   public handleError(errorResponse?, errorSubj?) {

//   }

//   private handleSignUp(responseData) {
   
//   }

//   private deleteUserOnNotVerifying(tokenId: string) {
    
//   }

//   private deleteUser(tokenId: string, userData) {
   
//   }

//   private onUserDataRecieved(response) {
    
//   }

//   private getUserData(tokenId: string, checkForDelete: boolean = false) {
   
//   }

//   public handlePhoneUser(phone: string, token: string) {
   
//   }



//   public signUp(email: string, password: string, confirmPassword: string, userName: string, phone: string) {
   
//   }

//   public verifyEmail(email: string, idToken: string) {
    
//   }

//   public resetPasswordOfUsers(email: string) {
    
//   }

//   public login(email: string, password: string) {
   
   
//   }

//   public handleAuthenticationNode(responseData) {
   
//   }

//   public autoLogin() {
   
//   }

//   autoLogOut(expiresTime: number) {
   
//   }

//   onLogOut() {
   
//   }

//   addUserNamePhoneToUserPath(userId: string) {
   
//   }

//   getUserInfo(userId: any) {
   
//   }

//   loadCurrentUserPath(userId) {
   
//   }


//   getEmailUserDetails(email: string) {
    
//   }

//   getPhoneUserDetails(phone: string) {
    
//   }

//   setPhoneUserDetails(name: string, phone: string) {
   
//   }
// }

class MockGroupService {
  groupNames: string[] = [];
  currentUserPath: string;
  groupIdGroupMapping = [];

  get getGroupNames() {
    return this.groupNames.slice();
  }

  get getGroupIdgroupMapping() {
    return this.groupIdGroupMapping.slice();
  }

  clearAllData() {
   
  }

  createNewGroup(groupName) {
    
  }

  addGroupToUserProfile(groupId: string, groupName: string) {
    
  }

  fetchGroupNameFromGroupId(groupId: string) {
    
  }

  fetchGroup() {
    
  }


  fetchGroupFromNode() {
    
  }

  handleUserGroupsFromNode(groupDetails) {
   
  }

  handleUserGroups(groupDetails) {
    
  }

  loadCurrentUserPath() {
   
  }

  addItemsToGroup(groupId: string, item: string) {

  }


  addPersonToGroup(groupId: string) {
   
  }

  addGroupNameToGroupId(groupId: string, groupName: string) {
   
  }

  getGroupNameFromGroupId(groupId: string) {
  
  }

  deleteGroupNameFromGroup(groupId: string) {
  }

  deleteGroupNameFromUser(groupId: string) {
    
  }

  deleteGroup(groupId: string) {
  }


  deleteGroupFromNode(groupId: string) {
  }

  leaveGroupFromNode(groupId: string) {
   
  }

  modifyGroupNameFromUser(groupId: string, groupName: string) {
   
  }

  modifyGroupNameFromGroup(groupId: string, groupName: string) {
   
  }

  deleteUnnecessaryData(key: string) {
  }

  deletePersonFromGroup(groupId: string) {
   
  }

  modifyGroupName(groupId: string, name: string) {
   
  }

  updateGroupNameFromNode(groupId: string, name: string) {
   
  }

  joinGroupUsingNode(groupId: string) {
  
  }

  setCurrentGroupId(groupName: string) {
    
  }

  autoLoadGroupId() {
   
  }

  ngOnDestroy() {
    
  }
}

describe('AppComponent', () => {
  let store: Store;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        NgxsModule.forRoot([DummyState]),
        HttpClientTestingModule,
        RouterTestingModule
      ],
    }).compileComponents();
    const authService = TestBed.inject(AuthService);
    const groupService = TestBed.inject(UserGroupService);
    spyOn(authService, 'autoLogin');
    spyOn(groupService, 'autoLoadGroupId');
    store = TestBed.inject(Store);  
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'MyHouseHoldApp'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app.title).toEqual('MyHouseHoldApp');
  });

  it('should get dummy state getData as null', () => {
    const data = store.selectSnapshot(state => state.Check.data);
    console.log(data);
    expect(data).toBe(null);
  })

});
