export class PhoneUserModel {
    constructor(private _phone: string, private _token: string) {

    }
    get token() {
        return this._token;
    }
    get userPhone() {
        return this._phone.split('+')[1];
    }
    get userUniqueId() {
        return this._phone.split('+')[1];
    }
}