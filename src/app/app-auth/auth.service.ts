import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, pipe, BehaviorSubject, Subject } from 'rxjs';
import { UserModel } from './user.model';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { AngularFireAuth } from '@angular/fire/auth'

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

    user = new BehaviorSubject<UserModel>(null);
    private autoLogOutInterval;
    public errorSub = new Subject<string>();


    public verifiedUser = new Subject<boolean>();
    currentUser: UserModel;
    currentExpireTime: number;

    constructor(private http: HttpClient,
        private router: Router,
        private fireAuth: AngularFireAuth) {

    }
    public handleError(errorResponse?: HttpErrorResponse, errorSubj?: Subject<string>) {
        let errorMessage = "An unknown error occured!!";
        if(typeof(errorResponse) === 'string') {
            return throwError(errorResponse);
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
        if(errorSubj) {
            errorSubj.next(errorMessage);
        }
        return throwError(errorMessage);
    }

    private handleSignUp(responseData: AuthResponse) {
        this.verifyEmail(responseData.email, responseData.idToken);
        //this.handleAuthentication(responseData);
    }

    private onUserDataRecieved(response) {
        if(response.users[0].emailVerified) {
            this.verifiedUser.next(true);
            localStorage.setItem('userData', JSON.stringify(this.currentUser));
            this.autoLogOut(this.currentExpireTime);
            this.user.next(this.currentUser);
        } else {
            this.verifiedUser.next(false);
        }
    }

    private getUserData(responseData: AuthResponse, tokenId: string) {
        this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI',
        {
            idToken: tokenId
        })
        .pipe(catchError((errorResponse) => {
            return this.handleError(errorResponse, this.errorSub);
        }),
        tap(this.onUserDataRecieved.bind(this))).subscribe();
    }


    private handleAuthentication(responseData: AuthResponse) {
        
        console.log(responseData);
        const expireDate = new Date(new Date().getTime() + (+responseData.expiresIn) * 1000);
        const user = new UserModel(responseData.email, responseData.localId, responseData.idToken, expireDate);
        
        
        // localStorage.setItem('userData', JSON.stringify(user));
        // this.autoLogOut((+responseData.expiresIn) * 1000);
        // this.user.next(user);
        
        this.currentUser = user;
        this.currentExpireTime = (+responseData.expiresIn) * 1000;
        this.getUserData(responseData, responseData.idToken);

    }

    signUp(email: string, password: string) {
        
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

    verifyEmail(email: string, idToken: string) {
        this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyC0T6afZwBlanup5OPIIlto90nsaE15acI', {
            "requestType": "VERIFY_EMAIL",
            "idToken": idToken
        }).pipe(catchError((errResponse) => {
            return this.handleError(errResponse, this.errorSub);
        }),tap((response) => {
            console.log(response);
        })).subscribe();
    }

    login(email: string, password: string) {
        
        // this.fireAuth.signInWithEmailAndPassword(email, password).then(response => {
        //     console.log(response);
        // });


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

    autoLogin() {
        const userData: {
            _email: string, 
            _userId: string,
            _token: string,
            _tokenExpires: string
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
}