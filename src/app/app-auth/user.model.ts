export class UserModel {
    // constructor(private _email: string, 
    //     private _userId: string,
    //     private _token: string,
    //     private _tokenExpires: Date) {
        
    // }

    // get token() {
    //     if(!this._tokenExpires || new Date() > this._tokenExpires) {
    //         return null;
    //     }
    //     return this._token;
    // }
    // get userUniqueId() {
    //     return this._email;
    // }
    // get userID() {
    //     return this._userId;
    // }

    constructor(private _token, private _email){

    }

    get token() {
        return this._token;
    }

    get userUniqueId() {
        return this._email;
    }
}