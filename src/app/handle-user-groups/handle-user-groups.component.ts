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
  }

  createGroup() {
    this.isCreateMode = true;
    this.isJoinMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
  }

  onCancel() {
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
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
        this.groupService.addGroupToUserProfile(this.uniqueId, groupName);
        this.groupService.addGroupNameToGroupId(this.uniqueId, groupName);
      });
    } else {
      this.error = "This group is already there !!";
    }
  }

  onSubmitJoin(form: NgForm) {
    const groupId = form.value['group-id'];
    this.groupService.getGroupNameFromGroupId(groupId).subscribe((groupName) => {
      this.groupService.addPersonToGroup(groupId);
      this.groupService.addGroupToUserProfile(groupId, groupName);
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
  }

  enableAddItems() {
    this.addItemsMode = true;
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.isShowGroups = false;
  }

  addItems(form: NgForm) {
    const groupId = form.value['group-id'];
    const item = form.value['item'];
    this.groupService.addItemsToGroup(groupId, item).subscribe((data) => {
      console.log(data);
    });
  }

}
