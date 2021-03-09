import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { groupMapping, UserGroupService } from './handle-user-groups.service';

@Component({
  selector: 'app-handle-user-groups',
  templateUrl: './handle-user-groups.component.html',
  styleUrls: ['./handle-user-groups.component.css']
})
export class HandleUserGroupsComponent implements OnInit {

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
  constructor(private groupService: UserGroupService,
    private router: Router) { 

  }
  ngOnInit(): void {
    this.groupService.clearAllData();
    this.groupService.fetchGroup().subscribe(()=>{
      this.groupNames = this.groupService.getGroupNames;
      this.groupList = this.groupService.getGroupIdgroupMapping;
    });
    this.groupService.groupSubject.next(null);
    this.groupService.alertSubject.subscribe((alert) => {
      this.alert = alert;
    });
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
    console.log(form);
    const groupName = form.value['group-name'];
    if(this.groupNames.indexOf(groupName) === -1) {
      this.groupService.createNewGroup(groupName).subscribe((response) => {
        this.uniqueId = response.body['name'];
        console.log(this.uniqueId);
        this.groupNames.push(groupName);
        this.groupService.addPersonToGroup(this.uniqueId);
        this.groupService.addGroupNameToGroupId(this.uniqueId, groupName);
        this.groupService.addGroupToUserProfile(this.uniqueId, groupName);
      });
    } else {
      this.error = "This group is already there !!";
    }
  }

  onSubmitJoin(form: NgForm) {
    const groupId = form.value['group-id'];
    this.groupService.getGroupNameFromGroupId(groupId).subscribe((groupName) => {
      if(groupName) {
        if(this.groupNames.indexOf(groupName) === -1) {
          this.groupService.addPersonToGroup(groupId);
          this.groupService.addGroupToUserProfile(groupId, groupName);
        } else {
          this.error = "You already joined to this group!!";
        }
      } else {
        this.error = "No such group is there !!";
      }
    });
  }

  navigateToGroup(item: groupMapping) {
    this.router.navigate(['/purchase-form/' + item.key]);
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

  showGroups() {
    this.isShowGroups = true;
    this.groupService.fetchGroup().subscribe(() => {
      this.groupNames = this.groupService.getGroupNames;
      this.groupList = this.groupService.getGroupIdgroupMapping;
    });
    this.isJoinMode = false;
    this.isCreateMode = false;
    this.addItemsMode = false;
    this.error = null;
    this.alert = null;
    this.disableModifyGroupName();
  }

  enableAddItems() {
    this.addItemsMode = true;
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.isShowGroups = false;
    this.error = null;
    this.alert = null;
  }

  addItems(form: NgForm) {
    const groupId = form.value['group-id'];
    const item = form.value['item'];
    this.groupService.addItemsToGroup(groupId, item).subscribe((data) => {
      console.log(data);
    });
  }

  enableModifyGroup() {
    this.isModificationMode = true;
    this.alert = null;
  }
  disableModifyGroupName() {
    this.isModificationMode = false;
  }

  onModifyGroupName(key: string, form: NgForm) {
    const newName = form.value['newGroupName'];
    if(this.groupNames.indexOf(newName) === -1) {
      this.error = null;
      this.groupService.modifyGroupName(key, newName);
    } else {
      this.error = "This group is already there !!";
    }
  }

}
