import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../app-auth/auth.service';
import { groupMapping, UserGroupService } from './handle-user-groups.service';

@Component({
  selector: 'app-handle-user-groups',
  templateUrl: './handle-user-groups.component.html',
  styleUrls: ['./handle-user-groups.component.css']
})
export class HandleUserGroupsComponent implements OnInit, OnDestroy {

  isCreateMode = false;
  isJoinMode = false;
  uniqueId: string;
  groupNames: string[] = [];
  error: string = null;
  groupList: groupMapping[] = [];
  isShowGroups = false;
  addItemsMode = false;
  isModificationMode = false;
  alert: string;
  currentIndex: number;
  subscription: Subscription;
  creatorSubscription: Subscription;
  userLeftSubscription: Subscription;
  currentUser: string;
  leavingMode = false;
  constructor(private groupService: UserGroupService,
    private router: Router, private authService: AuthService) { 

  }
  ngOnInit(): void {
    this.groupService.clearAllData();
    this.groupService.groupSubject.next(null);
    this.groupService.alertSubject.subscribe((alert) => {
      this.alert = alert;
    });
    this.creatorSubscription = this.authService.user.subscribe((userData) => {
      this.currentUser = userData ? userData.userUniqueId : null;
    });
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
    if(this.creatorSubscription) {
      this.creatorSubscription.unsubscribe();
    }
    if (this.userLeftSubscription) {
      this.userLeftSubscription.unsubscribe();
    }
  }

  createGroup() {
    this.isCreateMode = true;
    this.isJoinMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
    this.error = null;
    this.alert = null;
  }

  onCancel() {
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
    this.error = null;
    this.alert = null;
  }

  onSubmitCreateGroup(form: NgForm) {
    const groupName = form.value['group-name'];
    if(this.groupNames.indexOf(groupName) === -1) {
      this.groupService.createNewGroup(groupName).subscribe((response) => {
        this.uniqueId = response.body['name'];
        this.groupNames.push(groupName);
        this.groupService.addPersonToGroup(this.uniqueId);
        this.groupService.addGroupNameToGroupId(this.uniqueId, groupName).subscribe();
        this.groupService.addGroupToUserProfile(this.uniqueId, groupName).subscribe((response) => {
          this.groupService.deleteUnnecessaryData(this.uniqueId);
        });
      });
    } else {
      this.error = "This group is already there !!";
    }
  }

  onSubmitJoin(form: NgForm) {
    const groupId = form.value['group-id'];
    
    if(this.checkForDuplicateGroup(groupId)) {
      this.error = "You already joined to this group!!";
      this.alert = null;
    } else {
      this.groupService.getGroupNameFromGroupId(groupId).subscribe((groupName) => {
        if (groupName) {
          if (this.groupNames.indexOf(groupName) === -1) {
            this.groupService.addPersonToGroup(groupId);
            this.groupService.addGroupToUserProfile(groupId, groupName).subscribe();
            this.alert = "You successfully joined to the new group!!";
            this.error = null;
          } else {
            this.error = "You already joined to this group!!";
            this.alert = null;
          }
        } else {
          this.error = "No such group is there !!";
          this.alert = null;
        }
      });
    }
  }


  checkForDuplicateGroup(groupId: string) {
    for(let index = 0; index < this.groupList.length; index++) {
      if(this.groupList[index].key === groupId) {
        return true;
      }
    }
    return false;
  }

  navigateToGroup(item: groupMapping) {
    this.router.navigate(['/purchase-form/' + item.key]);
    this.groupService.setCurrentGroupId(item.key);
    this.groupService.groupSubject.next(item.key);
  }

  joinGroup() {
    this.isJoinMode = true;
    this.isCreateMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
    this.error = null;
    this.alert = null;
  }

  fetchAllGroups() {
    this.groupService.fetchGroup().subscribe();
    this.subscription = this.groupService.groupNamesLoaded.subscribe(this.handleGroupLoaded.bind(this));
  }

  handleGroupLoaded(isLoaded) {
    if (isLoaded) {
      this.groupNames = this.groupService.getGroupNames;
      this.groupList = this.groupService.getGroupIdgroupMapping;
      this.leavingMode = false;
    }
  }

  showGroups() {
    this.isShowGroups = true;
    this.fetchAllGroups();
    this.isJoinMode = false;
    this.isCreateMode = false;
    this.addItemsMode = false;
    this.error = null;
    this.alert = null;
    this.disableModifyGroupName();
  }

  enableAddItems() {
    this.fetchAllGroups();
    this.addItemsMode = true;
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.isShowGroups = false;
    this.error = null;
    this.alert = null;
  }

  addItems(form: NgForm) {
    this.alert = null;
    const groupId = form.value['group-id'];
    const item = form.value['item'];
    this.groupService.addItemsToGroup(groupId, item).subscribe((response) => {
      this.alert = "Item added successfully";
    });
  }

  enableModifyGroup(index) {
    this.isModificationMode = true;
    this.alert = null;
    this.currentIndex = index;
  }
  disableModifyGroupName() {
    this.isModificationMode = false;
  }

  onModifyGroupName(key: string, form: NgForm) {
    const newName = form.value['newGroupName'];
    if(this.groupNames.indexOf(newName) === -1) {
      this.error = null;
      this.leavingMode = true;
      this.isModificationMode = false;
      this.groupService.modifyGroupName(key, newName);
    } else {
      this.error = "This group is already there !!";
    }
  }

  onClickLeaveOrDelete(creator: string, groupId: string) {
    if(creator === this.currentUser) { //Delete case
      if(confirm("Are sure want to delete ?")) {
        this.leavingMode = true;
        this.groupService.deleteGroupNameFromUser(groupId).subscribe((responseData) => {
          responseData.subscribe(() => {
            this.groupService.deleteGroup(groupId).subscribe(() => {
              this.fetchAllGroups();
            });
          });
        });
      }
    } else { //Leave case
      this.leavingMode = true;
      this.groupService.deletePersonFromGroup(groupId);
      this.groupService.deleteGroupNameFromUser(groupId).subscribe((response)=>{
        response.subscribe();
      });
    }
  }
}
