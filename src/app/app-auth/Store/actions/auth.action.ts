export interface UserInfo {
    token: string,
    email: string,
    isLoggedIn: boolean
}
export class Login {
    static readonly type = "User login";
    constructor(public loginData: { email: string, password: string }) {

    }
}

export class AutoLogin {
    static readonly type = "Auto login";
    constructor(public loginData: { email: string, token: string }) {
        
    }
}

export class Logout {
    static readonly type=  "User logout";
    constructor() {
        
    }
}