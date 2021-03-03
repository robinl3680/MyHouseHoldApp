import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthResponse } from './auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls:['./auth.component.css']
})
export class AuthComponent implements OnInit {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    alert: string;
    isForgotPassword=false;
    hideAll=true;
    phoneNumber: number;
    loginWithPhone = false;
    otp: number;
    windowRef;

    constructor(private authService: AuthService,
        private router: Router) {
        this.windowRef = this.authService.windowRef;
    }

    ngOnInit() {
        this.authService.user.next(null);
        this.authService.errorSub.subscribe((error) => {
            this.error = error;
            this.isLoading = false;
            this.alert = null;
        });
    }

    onSubmit(form: NgForm) {
        const email = form.value.email;
        const password = form.value.password;
       
        this.isLoading = true;
        let authObs: Observable<AuthResponse>;

        if(this.isLoginMode) {
            this.authService.login(email, password);
        } else if(this.isForgotPassword){
            this.authService.resetPasswordOfUsers(email);
            this.authService.emailVerifyAlert.subscribe((alert) => {
                this.alert = alert;
                this.isLoginMode=true;
                this.isForgotPassword=false;
                form.reset();
                this.isLoading = false;
            });
            
        } 
        else {
            this.authService.signUp(email, password);
            this.authService.emailVerifyAlert.subscribe((alert) => {
                this.alert = alert;
                form.reset();
                this.isLoading = false;
            });
            this.onSwitchMode();
        }

        this.authService.verifiedUser.subscribe((data) => {
            if(data) {
                this.isLoading = false;
                this.router.navigate(['/purchase-form']);
            } else {
                this.isLoading = false;
                this.error = "Please verify your email!!"
            }
        });


        // if(this.isLoginMode) {
        //     authObs = this.authService.login(email, password).subscribe(());
        // } else {
        //     authObs = this.authService.signUp(email, password);
        // }
        // authObs.subscribe((resPonse)=>{
        //         this.isLoading = false;
        //         this.router.navigate(['/purchase-form']);
        //     }, errorMessage => {
        //         this.isLoading = false;
        //         this.error = errorMessage;
        // });
    }

    resetPassword(){
      this.isForgotPassword=true;
      this.isLoginMode=false;
      this.isLoading=false;
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
        this.error = null;
    }

    signInWithPhone() {
        this.loginWithPhone = !this.loginWithPhone;
        this.isForgotPassword=false;
    }
}