import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService} from './auth.service';
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
    isForgotPassword = false;
    loginWithPhone = false;

    constructor(private authService: AuthService,
        private router: Router) {  }

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
    }

    resetPassword(){
        this.isForgotPassword = true;
        this.isLoginMode = false;
        this.isLoading = false;
    }

    onSwitchMode() {
        if (!this.isForgotPassword) {
            this.isLoginMode = !this.isLoginMode;
            this.error = null;
        } else {
            this.isLoginMode = true;
            this.isForgotPassword = !this.isForgotPassword;
        }
    }

    signInWithPhone() {
        this.loginWithPhone = !this.loginWithPhone;
        this.router.navigate(['phone-auth']);
    }
    validatePassword(form: NgForm) {
        console.log(form);
    }

}