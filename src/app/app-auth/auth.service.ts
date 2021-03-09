import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Subject } from 'rxjs';
import { UserModel } from './user.model';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { PhoneUserModel } from './phone-user-model';
export interface AuthResponse {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user = new BehaviorSubject<UserModel | PhoneUserModel>(null);
    private autoLogOutInterval;
    public errorSub = new Subject<string>();

    public verifiedUser = new Subject<boolean>();
    public emailVerifyAlert = new Subject<string>();
    currentUser: UserModel;
    currentExpireTime: number;
    isUserVerified = false;
    private autoDeleteInterval;
    currentUserInfo = {};
    currentUserPath: string;
    constructor(private http: HttpClient,
        private router: Router) { }

    public handleError(errorResponse?: HttpErrorResponse, errorSubj?: Subject<string>) {
        let errorMessage = "An unknown error occured please try after sometime!!";
        this.currentUserInfo = {};
        if(typeof(errorResponse) === 'string') {
            if(errorSubj) {
                errorSubj.next(errorResponse);
            }
            return throwError(errorResponse);
        }
        if(errorSubj) {
            errorSubj.next(errorMessage);
        }
        if( !errorResponse || !errorResponse.error || !errorResponse.error.error) {
            return throwError(errorMessage);
        }
        switch(errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This mail id already exists, please try to login!!';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'Entered password is wrong!!';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'There is no such user registered, please signup!!';
                break;
        }
        if(errorResponse.status === StatusCodes.UNAUTHORIZED) {
            errorMessage = "You're aunauthorized to access this page, please login!!"
        }
        return throwError(errorMessage);
    }

    private handleSignUp(responseData: AuthResponse) {
        this.verifyEmail(responseData.email, responseData.idToken);
        this.deleteUserOnNotVerifying(responseData.idToken);
    }

    private deleteUserOnNotVerifying(tokenId: string) {
        const M_SEC = 1000;
        const ONE_HOUR = 120;
        this.autoDeleteInterval = setTimeout(() => {
            this.getUserData(tokenId, true);
        }, ONE_HOUR * M_SEC);
    }

    private deleteUser(tokenId: string, userData) {
        if(!userData.users[0].emailVerified) {
            this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',
            {
                idToken: tokenId
            })
            .pipe(catchError((errorResponse) => {
                return this.handleError(errorResponse, this.errorSub);
            })).subscribe((data) => {
                this.errorSub.next('User is not registered as not verifying the mail, please signup again');
            });
        }
    }

    private onUserDataRecieved(response) {
        if(response.users[0].emailVerified || response.users[0].isUserVerified) {
            this.verifiedUser.next(true);
            localStorage.setItem('userData', JSON.stringify(this.currentUser));
            this.autoLogOut(this.currentExpireTime);
            this.user.next(this.currentUser);
            if(this.currentUserInfo) {
                this.user.subscribe((response) => {
                    if(response) {
                        this.addUserNamePhoneToUserPath(this.currentUser.userUniqueId);
                    }
                });
            }
            clearInterval(this.autoDeleteInterval);
        } else {
            this.verifiedUser.next(false);
        }
    }

    private getUserData(tokenId: string, checkForDelete: boolean = false) {
        this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',
        {
            idToken: tokenId
        })
        .pipe(catchError((errorResponse) => {
            return this.handleError(errorResponse, this.errorSub);
        }),
        tap((userData) => {
            if(checkForDelete) {
                this.deleteUser(tokenId, userData);
            } else {
                this.onUserDataRecieved(userData);
            }
        })).subscribe();
    }

    public handlePhoneUser(phone: string, token: string) {
        this.user.next(new PhoneUserModel(phone, token));
        //this.getUserData(token);
    }


    private handleAuthentication(responseData: AuthResponse) {
        const expireDate = new Date(new Date().getTime() + (+responseData.expiresIn) * 1000);
        const user = new UserModel(responseData.email, responseData.localId, responseData.idToken, expireDate);
        this.currentUser = user;
        this.currentExpireTime = (+responseData.expiresIn) * 1000;
        this.getUserData(responseData.idToken);
    }

    public signUp(email: string, password: string, userName: string, phone: string) {
        this.currentUserInfo['userName'] = userName;
        this.currentUserInfo['phone'] = phone;
        this.http.post<AuthResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',
        {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError((errorResponse) => {
            return this.handleError(errorResponse, this.errorSub);
        }),
            tap(this.handleSignUp.bind(this))).subscribe();
    }

    public verifyEmail(email: string, idToken: string) {
        this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI', {
            "requestType": "VERIFY_EMAIL",
            "idToken": idToken
        }).pipe(catchError((errResponse) => {
            return this.handleError(errResponse, this.errorSub);
        }), tap((response) => {
            this.emailVerifyAlert.next('Successfully sent a mail to verify your accout, please verify and login!!');
        })).subscribe();
    }

    public resetPasswordOfUsers(email: string) {
        this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',{
            "requestType":"PASSWORD_RESET",
            "email":email
        }).pipe(catchError((errResponse)=>{
            return this.handleError(errResponse, this.errorSub);
        }), tap((response) => {
            this.emailVerifyAlert.next('Successfully sent a reset password link to your mail id, please give reset your password!');
        })).subscribe();
    }

    public login(email: string, password: string) {
        this.http.post<AuthResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',
        {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError((errorResponse) => {
            return this.handleError(errorResponse, this.errorSub);
        }),
            tap(this.handleAuthentication.bind(this))).subscribe();
    }

    public autoLogin() {
        const userData: {
            _email: string, 
            _userId: string,
            _token: string,
            _tokenExpires: string,
            _userDetails: object
        } = JSON.parse(localStorage.getItem('userData'));
        if(userData) {
            const loadedUser = new UserModel(userData._email, userData._userId, userData._token, new Date(userData._tokenExpires));
            if(loadedUser.token) {
                const expires = new Date(userData._tokenExpires).getTime() - new Date().getTime();
                this.autoLogOut(expires);
                this.user.next(loadedUser);
            }
        }
    }

    autoLogOut(expiresTime: number) {
        const minLimit = 1000 * 60 * 10;
        expiresTime = minLimit < expiresTime ? minLimit : expiresTime;
        this. autoLogOutInterval = setTimeout(()=>{
            this.onLogOut();
        }, expiresTime);
    }

    onLogOut() {
        this.user.next(null);
        localStorage.removeItem('userData');
        if(this.autoLogOutInterval) {
            clearInterval(this.autoLogOutInterval);
            this.autoLogOutInterval = null;
        }
        this.router.navigate(['/auth']);
    }

    addUserNamePhoneToUserPath(userId: string) {
        this.loadCurrentUserPath(userId);
        this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/userInfo.json',
            {
                userName: this.currentUserInfo['userName'],
                phone: this.currentUserInfo['phone']
            },
            {
                observe: 'response'
            })
            .pipe(catchError((errorResponse) => {
                return this.handleError(errorResponse, this.errorSub);
            })).subscribe();
    }

    getUserInfo(userId: any) {
        if(isNaN(userId)) {
            return this.getEmailUserDetails(userId);
        } else {
            return this.getPhoneUserDetails(userId);
        }
    }

    loadCurrentUserPath(userId) {
        if (userId.indexOf('@') > -1) {
            this.currentUserPath = userId.replace(/[^a-zA-Z0-9]/g, '');
        } else {
            this.currentUserPath = userId;
        }
    }


    getEmailUserDetails(email: string) {
        this.loadCurrentUserPath(email);
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/protectedData/userData/' + this.currentUserPath + '/userInfo.json')
            .pipe(
                map((responseData) => {
                    const userInfo = {};
                    for (const key in responseData) {
                        userInfo['userName'] = responseData[key].userName;
                        userInfo['phone'] = responseData[key].phone;
                        return userInfo;
                    }
                }),
                catchError((errorResponse) => {
                    return this.handleError(errorResponse, this.errorSub);
                })
            ); 
    }

    getPhoneUserDetails(phone: string) {
        return this.http.get('https://householdapp-7db63-default-rtdb.firebaseio.com/phoneUserDetails/' + phone + '/userInfo.json')
            .pipe(
                map((responseData) => {
                    const userInfo = {};
                    for (const key in responseData) {
                        userInfo['userName'] = responseData[key].userName;
                        userInfo['phone'] = responseData[key].phone;
                        return userInfo;
                    }
                }),
                catchError((errorResponse) => {
                    return this.handleError(errorResponse, this.errorSub);
                })
            );
    }

    setPhoneUserDetails(name: string, phone: string) {
        this.http.post('https://householdapp-7db63-default-rtdb.firebaseio.com/phoneUserDetails/' + phone + '/userInfo.json', 
        {
           userName: name,
           phone: phone 
        })
            .pipe(
                catchError((errorResponse) => {
                    return this.handleError(errorResponse, this.errorSub);
                })
            ).subscribe();
    }

}