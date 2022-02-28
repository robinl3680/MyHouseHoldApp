import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, tap } from "rxjs/operators";
import { AuthService } from "src/app/app-auth/auth.service";
import { UserGroupService } from "../../handle-user-groups.service";
import { GetAllGroups, GroupInfo } from "../actions/handle-user-groups.action";

@State<GroupInfo>({
    name: 'Group',
    defaults: {
        groupNames: [],
        groupIdGroupMapping: null
    }
})
@Injectable()
export class GroupState {
    constructor(private groupService: UserGroupService, private authService: AuthService) {

    }
    @Selector()
    static getUserGroups(state: GroupInfo) {
        return state.groupNames;
    }
    @Selector()
    static getUserGroupMapping(state: GroupInfo) {
        return state.groupIdGroupMapping;
    }
    @Action(GetAllGroups)
    getAllUserGroups(ctx: StateContext<GroupInfo>, action: GetAllGroups) {
        ctx.patchState({
            ...{
                groupNames: [],
                groupIdGroupMapping: null
            }
        });
        return this.groupService.fetchGroupFromNode()
            .pipe(
                tap((response: { groups: [] }) => {
                    let groups = response.groups;
                    const groupNames = [];
                    const groupIdGroupMapping: { key: string, groupName: string, creator: string }[] = [];
                    for (let index = 0; index < groups.length; index++) {
                        const group = groups[index];
                        groupNames.push(group['name']);
                        const groupCreated = { key: group['_id'], groupName: group['name'], creator: group['creator'] };
                        groupIdGroupMapping.push(groupCreated);
                    }
                    if (groups.length === 0) {
                        this.groupService.alertSubject.next("You don't have any group currently !!");
                    }
                    ctx.patchState({
                        ...{
                            groupNames,
                            groupIdGroupMapping
                        }
                    });
                }),
                catchError(err => {
                    return this.authService.handleError(err, this.authService.errorSub);
                })
            );
    }
}