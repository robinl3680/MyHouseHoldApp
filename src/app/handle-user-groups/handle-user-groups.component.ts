import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthService } from '../app-auth/auth.service';
import { SetData } from '../app-auth/Store/actions/dummy.action';
import { ItemDetails } from '../items.model';
import { ItemsService } from '../items.service';
import { groupMapping, UserGroupService } from './handle-user-groups.service';

@Component({
  selector: 'app-handle-user-groups',
  templateUrl: './handle-user-groups.component.html',
  styleUrls: ['./handle-user-groups.component.css']
})
export class HandleUserGroupsComponent implements OnInit, OnDestroy {

  isCreateMode = true;
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
  updateOrDeleteItemsMode: boolean;
  loadItems: boolean;
  items: string[];
  itemsKey: string[];
  selectedGroupId: string;
  activeSection: ActiveSecion = 'createMode';
  cards = [
    {
      title: 'Do you want to create a new group?',
      btn: 'create',
      section: 'createMode'
    },
    {
      title: 'Want to join a new group?',
      btn: 'join',
      section: 'joinMode'
    },
    {
      title: 'Manage your groups',
      btn: 'Manage',
      section: 'manageMode'
    },
    {
      title: 'Item management',
      btn: 'manage',
      section: 'itemManagementMode'
    }
  ];
  constructor(private groupService: UserGroupService,
    private router: Router, private authService: AuthService,
    private itemService: ItemsService,
    private http: HttpClient,
    private store: Store) { 

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
    this.fetchAllGroups();
    this.store.dispatch(new SetData(Math.floor(Math.random() * 10)));
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
    this.updateOrDeleteItemsMode = false;
    this.items = [];
    this.itemsKey = [];
    this.error = null;
    this.alert = null;
  }

  onCancel() {
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.addItemsMode = false;
    this.isShowGroups = false;
    this.updateOrDeleteItemsMode = false;
    this.items = [];
    this.itemsKey = [];
    this.error = null;
    this.alert = null;
  }

  onSubmitCreateGroup(form: NgForm) {
    const groupName = form.value['group-name'];
    if(this.groupNames.indexOf(groupName) === -1) {

      this.groupService.createNewGroup(groupName).subscribe((response: any) => {
        this.uniqueId = response.group['_id'];
        this.groupNames.push(groupName);
        this.fetchAllGroups();
        this.error = null;
      });

      // this.groupService.createNewGroup(groupName).subscribe((response) => {
      //   this.uniqueId = response.body['name'];
      //   this.groupNames.push(groupName);
      //   this.groupService.addPersonToGroup(this.uniqueId);
      //   this.groupService.addGroupNameToGroupId(this.uniqueId, groupName).subscribe();
      //   this.groupService.addGroupToUserProfile(this.uniqueId, groupName).subscribe((response) => {
      //     this.groupService.deleteUnnecessaryData(this.uniqueId);
      //   });
      // });
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
    //   this.groupService.getGroupNameFromGroupId(groupId).subscribe((groupName) => {
    //     if (groupName) {
    //       if (this.groupNames.indexOf(groupName) === -1) {
    //         this.groupService.addPersonToGroup(groupId);
    //         this.groupService.addGroupToUserProfile(groupId, groupName).subscribe();
    //         this.alert = "You successfully joined to the new group!!";
    //         this.error = null;
    //       } else {
    //         this.error = "You already joined to this group!!";
    //         this.alert = null;
    //       }
    //     } else {
    //       this.error = "No such group is there !!";
    //       this.alert = null;
    //     }
    //   });

      this.groupService.joinGroupUsingNode(groupId)
      .subscribe((group) => {
        if(group) {
          // console.log(group);
          this.alert = 'You successfully joined to the new group!!';
          this.error = null;
        }
      }, err => {
        this.error = err;
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
    this.updateOrDeleteItemsMode = false;
    this.items = [];
    this.itemsKey = [];
    this.error = null;
    this.alert = null;
  }

  fetchAllGroups() {
    this.groupService.fetchGroup().subscribe((data) => {
      this.groupNames = this.groupService.getGroupNames;
      this.groupList = this.groupService.getGroupIdgroupMapping;
      this.leavingMode = false;
    });
    //this.subscription = this.groupService.groupNamesLoaded.subscribe(this.handleGroupLoaded.bind(this));
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
    this.updateOrDeleteItemsMode = false;
    this.items = [];
    this.itemsKey = [];
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
    this.updateOrDeleteItemsMode = false;
    this.items = [];
    this.itemsKey = [];
    this.error = null;
    this.alert = null;
  }

  enableDeleteOrUpdate() {
    this.updateOrDeleteItemsMode = true;
    this.addItemsMode = false;
    this.isCreateMode = false;
    this.isJoinMode = false;
    this.isShowGroups = false;
    this.items = [];
    this.itemsKey = [];
    this.error = null;
    this.alert = null;
  }

  addItems(form: NgForm) {
    this.alert = null;
    const item = form.value['item'];
    const groupId = form.value['group-id'];
    this.groupService.addItemsToGroup(groupId, item).subscribe((response) => {
      if(response) {
        this.alert = "Item added successfully";
      } else {
        this.error = "Item is already existing";
      }
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
      // this.groupService.modifyGroupName(key, newName);

      

    } else {
      this.error = "This group is already there !!";
    }
  }

  onClickLeaveOrDelete(creator: string, groupId: string) {
    if(creator === this.currentUser) { //Delete case
      if(confirm("Are sure want to delete ?")) {
        this.leavingMode = true;
        // this.groupService.deleteGroupNameFromUser(groupId).subscribe((responseData) => {
        //   responseData.subscribe(() => {
        //     this.groupService.deleteGroup(groupId).subscribe(() => {
        //       this.fetchAllGroups();
        //     });
        //   });
        // });


        this.groupService.deleteGroupFromNode(groupId)
        .subscribe(res => {
          this.fetchAllGroups();
        });


      }
    } else { //Leave case
      this.leavingMode = true;
      // this.groupService.deletePersonFromGroup(groupId);
      // this.groupService.deleteGroupNameFromUser(groupId).subscribe((response)=>{
      //   response.subscribe();
      // });


      this.groupService.leaveGroupFromNode(groupId)
      .subscribe(res => {
        this.fetchAllGroups();
      });

    }
  }

  onModelChangeForUpdateDeleteItem(data) {
    this.items = [];
    this.itemsKey = [];
    const groupName = data.value['group-id'];
    if(groupName) {
      this.loadItems = true;
      this.itemService.accessItems(groupName).subscribe((items) => {
        this.items = items.itemArray;
        //this.itemsKey = items.itemKey;
      });
    }
  }

  onDeleteItem(formData, index) {
    // if(confirm("Are sure want to delete ?")) {
    //   const groupId = formData.value['group-id'];
    //   const itemKey = this.itemsKey[index];
    //   this.itemService.deleteItemEntry(groupId, itemKey).subscribe(result => {
    //     this.alert = "Item deleted successfully";
    //     this.onModelChangeForUpdateDeleteItem(formData);
    //   });
    // }

    if (confirm("Are sure want to delete ?")) {
      const groupId = formData.value['group-id'];
      const itemKey = this.items[index];
      this.itemService.deleteItemEntry(groupId, itemKey).subscribe(result => {
        this.alert = "Item deleted successfully";
        this.onModelChangeForUpdateDeleteItem(formData);
      });
    }

  }

  onUpdateItem(formData, index, itemData) {
    const groupId = formData.value['group-id'];
    const itemKey = this.items[index];
    const itemName = itemData.value;
    this.itemService.updateItemEntry(groupId, itemKey, itemName).subscribe(result => {
      this.alert = "Item updated successfully";
      this.onModelChangeForUpdateDeleteItem(formData);
    });
  }

  onChangeActiveSection(section: ActiveSecion) {
    this.activeSection = section;
  }

}

export type ActiveSecion = 'createMode' | 'joinMode' | 'manageMode' | 'itemManagementMode';
