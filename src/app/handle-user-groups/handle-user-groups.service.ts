import { HttpClient } from "@angular/common/http";
import { isNgContent } from "@angular/compiler";
import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { catchError, exhaustMap, map, tap } from "rxjs/operators";
import { AuthService } from "../app-auth/auth.service";
import { ItemsService } from "../items.service";

export interface groupMapping {
    key: string,
    groupName: string,
    creator: string
}

@Injectable({
    providedIn: 'root'
})


export class UserGroupService implements OnDestroy {

    groupNames: string[] = [];
    currentUserPath: string;
    groupIdGroupMapping: groupMapping[] = [];
    groupSubject = new BehaviorSubject<string>(null);
    alertSubject = new Subject<string>();
    groupNamesLoaded = new Subject<boolean>();
    currentGroupId: string;
    constructor(private http: HttpClient, private authService: AuthService,
        private itemService: ItemsService) {
        
    }

    get getGroupNames() {
        return this.groupNames.slice();
    }

    get getGroupIdgroupMapping() {
        return this.groupIdGroupMapping.slice();
    }

    clearAllData() {
        this.groupNames = [];
        this.currentUserPath = null;
        this.groupIdGroupMapping = [];
    }

    createNewGroup(groupName) {
        // this.loadCurrentUserPath();
        // return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '.json', 
        // {
        //     groupName: groupName
        // },
        //     {
        //         observe: 'response'
        //     })
        //     .pipe(catchError((errorResponse) => {
        //         return this.authService.handleError(errorResponse, this.authService.errorSub);
        //     }));

        this.http.post('https://house-hold-app.herokuapp.com/groups/create', {
            name: groupName
        }).pipe(
            catchError(errorResponse => {
            return this.authService.handleError(errorResponse, this.authService.errorSub);
        })).subscribe((data) => {
            console.log(data);
        });
    }

    addGroupToUserProfile(groupId: string, groupName: string) {
        this.loadCurrentUserPath();
        return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json',
            {
                groupId: groupId,
                groupName: groupName
            },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            }));
    }

    fetchGroupNameFromGroupId(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames.json')
            .pipe(
                map((responseData) => {
                    for(const key in responseData) {
                        const groupObj = {};
                        groupObj['groupName'] = responseData[key].groupName;
                        groupObj['creator'] = responseData[key].creator;
                        return groupObj;
                    }
                }),
                catchError((errorResponse) => {
                    return this.authService.handleError(errorResponse, this.authService.errorSub);
                })
            );
    }

    fetchGroup() {
        // this.loadCurrentUserPath();
        // return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json')
        //     .pipe(
        //         tap(this.handleUserGroups.bind(this)),
        //         catchError((errorResponse) => {
        //             return this.authService.handleError(errorResponse, this.authService.errorSub);
        //         })
        //     );
        return this.fetchGroupFromNode();
    }


    fetchGroupFromNode() {
        return this.http.get('https://house-hold-app.herokuapp.com/groups/getAll')
            .pipe(
                tap(this.handleUserGroupsFromNode.bind(this)),
                catchError(err => {
                    return this.authService.handleError(err, this.authService.errorSub);
                })
            );
    }

    handleUserGroupsFromNode(groupDetails) {
        this.groupNames = [];
        this.groupIdGroupMapping = [];
        let groups = groupDetails.groups;
        for(let index = 0; index < groups.length; index++) {
            const group = groups[index];
            this.groupNames.push(group['name']);
            const groupCreated: groupMapping = { key: group['_id'], groupName: group['name'], creator: group['creator'] };
            this.groupIdGroupMapping.push(groupCreated);
        }
        if(groups.length === 0) {
            this.alertSubject.next("You don't have any group currently !!");
        }
    }
    
    handleUserGroups(groupDetails) {
        this.groupNames = [];
        this.groupIdGroupMapping = [];
        if(groupDetails) {
            let length = Object.keys(groupDetails).length;
            let count = 0;
            for (const key in groupDetails) {
                this.fetchGroupNameFromGroupId(groupDetails[key].groupId).subscribe((groupObj) => {
                    if(groupObj) {
                        count++;
                        this.groupNames.push(groupObj['groupName']);
                        const group: groupMapping = { key: groupDetails[key].groupId, groupName: groupObj['groupName'], creator: groupObj['creator'] };
                        this.groupIdGroupMapping.push(group);
                    } else {
                        length = length - 1;
                        this.deleteGroupNameFromUser(groupDetails[key].groupId).subscribe((response) => {
                            response.subscribe(() => {
                                this.alertSubject.next("The group which you joined: " + groupDetails[key].groupName + " is deleted by creator");
                            });
                        });
                    }
                    if (count === length) {
                        this.groupNamesLoaded.next(true);
                    }
                });
            }
        } else {
            this.groupNamesLoaded.next(true);
            this.alertSubject.next("You don't have any group currently !!");
        }
    }

    loadCurrentUserPath() {
        if (this.authService.user.value.userUniqueId.indexOf('@') > -1) {
            this.currentUserPath = this.authService.user.value.userUniqueId.replace(/[^a-zA-Z0-9]/g, '');
        } else {
            this.currentUserPath = this.authService.user.value.userUniqueId;
        }
    }

    addItemsToGroup(groupId: string, item: string) {
        // return this.itemService.accessItems(groupId).pipe(exhaustMap((items) => {
        //     if(items.itemArray.indexOf(item) === -1) {
        //         return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items.json', {
        //             itemName: item
        //         },
        //             {
        //                 observe: 'response'
        //             })
        //             .pipe(catchError((errorResponse) => {
        //                 return this.authService.handleError(errorResponse, this.authService.errorSub);
        //             }));
        //     } else {
        //         return of(null);
        //     }
        // }))


        return this.http.post('https://house-hold-app.herokuapp.com/groups/addItem', {
            groupId: groupId,
            item: item
        })
            .pipe(
                catchError(err => {
                    return this.authService.handleError(err, this.authService.errorSub);
                })
            );

    }


    addPersonToGroup(groupId: string) {
        this.authService.getUserInfo(this.authService.user.value.userUniqueId).subscribe((userInfo) => {
            this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/persons.json', {
                userName: userInfo['userName'],
                mobileNumber: userInfo['phone'],
                userUniqueId: this.authService.user.value.userUniqueId
            },
                {
                    observe: 'response'
                })
                .pipe(catchError((errorResponse) => {
                    return this.authService.handleError(errorResponse, this.authService.errorSub);
                })).subscribe();  
        })
    }

    addGroupNameToGroupId(groupId: string, groupName: string) {
        return this.http.patch('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames/groupInfo.json', {
            groupName: groupName,
            creator: this.authService.user.value.userUniqueId
        },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            }));
    }

    getGroupNameFromGroupId(groupId: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames.json')
            .pipe(
                map((responseData) => {
                    for(const key in responseData) {
                        return responseData[key].groupName
                    }
                }),
                catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            }));
    }

    deleteGroupNameFromGroup(groupId: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames.json');
    }

    deleteGroupNameFromUser(groupId: string) {
        this.loadCurrentUserPath();
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json')
        .pipe(map((responseData) => {
            for(const key in responseData) {
                if(responseData[key].groupId === groupId) {
                    return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails/' + key +'/.json');
                }
            }
        }));
    }

    deleteGroup(groupId: string) {
        return this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '.json'); 
    }


    deleteGroupFromNode(groupId: string) {
        return this.http.delete(`https://house-hold-app.herokuapp.com/groups/delete/${groupId}`);
    }

    leaveGroupFromNode(groupId: string) {
        return this.http.post('https://house-hold-app.herokuapp.com/groups/leave', {
            groupId: groupId
        });
    }

    modifyGroupNameFromUser(groupId: string, groupName: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json')
            .pipe(map((responseData) => {
                for (const key in responseData) {
                    if (responseData[key].groupId === groupId) {
                        return this.http.patch('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails/' + key + '/.json',
                        {
                            groupId: groupId,
                            groupName: groupName
                        });
                    }
                }
            }));
    }

    modifyGroupNameFromGroup(groupId: string, groupName: string) {
        return this.http.patch('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames/groupInfo.json', 
        {
            groupName: groupName,
            creator: this.authService.user.value.userUniqueId
        }); 
    }

    deleteUnnecessaryData(key: string) {
        this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/' + key + '.json').subscribe();
    }

    deletePersonFromGroup(groupId: string) {
        this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/persons.json')
            .subscribe((responseData) => {
                for (const key in responseData) {
                    if (responseData[key].userUniqueId === this.authService.user.value.userUniqueId) {
                        this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/persons/' + key + '/.json').subscribe(()=> {
                            this.fetchGroup().subscribe();
                        });
                    }
                }
            });
    }

    modifyGroupName(groupId: string, name: string) {
        this.modifyGroupNameFromUser(groupId, name).subscribe((response) => {
            if(response) {
                response.subscribe(() => {
                    this.modifyGroupNameFromGroup(groupId, name).subscribe(() => {
                        this.alertSubject.next("Successfully updated !!");
                        this.fetchGroup().subscribe();
                    });
                });
            }
        });
    }

    updateGroupNameFromNode(groupId: string, name: string) {
        this.http.post('https://house-hold-app.herokuapp.com/groups/modifyName', {
            groupId: groupId,
            newName: name
        }).subscribe();
    }

    joinGroupUsingNode(groupId: string) {
        return this.http.post('https://house-hold-app.herokuapp.com/groups/join', {
            groupId: groupId
        });
    }

    setCurrentGroupId(groupName: string) {
        this.currentGroupId = groupName;
        localStorage.setItem('groupId', this.currentGroupId);
    }

    autoLoadGroupId() {
        this.currentGroupId = localStorage.getItem('groupId');
        if(this.currentGroupId) {
            this.groupSubject.next(this.currentGroupId);
        }
    }

    ngOnDestroy() {
        this.groupNames = null;
        this.groupIdGroupMapping = null;
    }
}