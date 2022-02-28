export interface GroupInfo {
    groupNames: string[],
    groupIdGroupMapping: { key: string, groupName: string, creator: string }[]
}
export class GetAllGroups {
    static readonly type = "Get groups";
    constructor() {

    }
}