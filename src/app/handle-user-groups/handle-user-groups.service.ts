import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { AuthService } from "../app-auth/auth.service";

export interface groupMapping {
    key: string,
    groupName: string
}

@Injectable({
    providedIn: 'root'
})


export class UserGroupService implements OnDestroy {

    groupNames: string[] = [];
    currentUserPath: string;
    groupIdGroupMapping: groupMapping[] = [];
    groupSubject = new Subject<string>();
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
            })).subscribe();
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
        for(const key in groupDetails) {
            if (this.groupNames.indexOf(groupDetails[key].groupName) === -1) {
                this.groupNames.push(groupDetails[key].groupName);
                const group: groupMapping = { key: groupDetails[key].groupId, groupName: groupDetails[key].groupName };
                this.groupIdGroupMapping.push(group);
            }
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
                mobileNumber: userInfo['phone']
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
            groupName: groupName
        },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            })).subscribe();
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

    ngOnDestroy() {
        this.groupNames = null;
        this.groupIdGroupMapping = null;
    }
}