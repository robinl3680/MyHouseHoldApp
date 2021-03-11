import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { AuthService } from "../app-auth/auth.service";

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
    groupSubject = new Subject<string>();
    alertSubject = new Subject<string>();
    groupNamesLoaded = new Subject<boolean>();
    constructor(private http: HttpClient, private authService: AuthService) {
        
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
        this.loadCurrentUserPath();
        return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '.json', 
        {
            groupName: groupName
        },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            }));
        }

    addGroupToUserProfile(groupId: string, groupName: string) {
        this.loadCurrentUserPath();
        this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json',
            {
                groupId: groupId,
                groupName: groupName
            },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            })).subscribe((responseData) => {
                this.deleteUnnecessaryData(groupId);
            });
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
        this.loadCurrentUserPath();
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json')
            .pipe(
                tap(this.handleUserGroups.bind(this)),
                catchError((errorResponse) => {
                    return this.authService.handleError(errorResponse, this.authService.errorSub);
                })
            );
    }

    
    handleUserGroups(groupDetails) {
        this.groupNames = [];
        this.groupIdGroupMapping = [];
        if(groupDetails) {
            const length = Object.keys(groupDetails).length;
            let count = 0;
            for (const key in groupDetails) {
                this.fetchGroupNameFromGroupId(groupDetails[key].groupId).subscribe((groupObj) => {
                    if(groupObj) {
                        count++;
                        this.groupNames.push(groupObj['groupName']);
                        const group: groupMapping = { key: groupDetails[key].groupId, groupName: groupObj['groupName'], creator: groupObj['creator'] };
                        this.groupIdGroupMapping.push(group);
                        if (count === length) {
                            this.groupNamesLoaded.next(true);
                        }
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
        return this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/items.json', {
            itemName: item
        },
        {
            observe: 'response'
        })
            .pipe(catchError((errorResponse) => {
            return this.authService.handleError(errorResponse, this.authService.errorSub);
        }));
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
        this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames.json', {
            groupName: groupName,
            creator: this.authService.user.value.userUniqueId
        },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            })).subscribe((responseData)=>{
                this.alertSubject.next("Successfully updated !!");
            });
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
        this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/' + groupId + '/groupNames.json').subscribe();
    }

    deleteGroupNameFromUser(groupId) {
        this.loadCurrentUserPath();
        this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails.json')
        .subscribe((responseData) => {
            for(const key in responseData) {
                if(responseData[key].groupId === groupId) {
                    this.http.delete('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/groupDetails/' + key +'/.json').subscribe();
                }
            }
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
        this.deleteGroupNameFromUser(groupId);
        this.deleteGroupNameFromGroup(groupId);
        this.addGroupNameToGroupId(groupId, name);
        this.addGroupToUserProfile(groupId, name);
    }

    ngOnDestroy() {
        this.groupNames = null;
        this.groupIdGroupMapping = null;
    }
}