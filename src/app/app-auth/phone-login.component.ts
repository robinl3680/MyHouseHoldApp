import { Component, OnInit } from '@angular/core';
import  firebase from 'firebase';
import { WindowService } from '../app-auth/window.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
export class PhoneNumber {
  country: string;
  area: string;

  get e164() {
    const num = this.country + this.area;
    return `+${num}`
  }
}

@Component({
  selector: 'app-phone-login-auth',
  templateUrl: './phone-login.component.html',
  providers: [WindowService]
})
export class PasswordlessAuthComponent implements OnInit {

  windowRef: any;
  phoneNumber = new PhoneNumber();
  verificationCode: string;
  user: any;
  sendotpEnables=true;
  constructor(
    private win: WindowService,private router: Router,private authService:AuthService
  ) { }

  ngOnInit() {
    this.windowRef = this.win.windowRef;
    if (!firebase.apps.length) {
        firebase.initializeApp(environment.firebase);
     }else {
        firebase.app(); // if already initialized, use that one
     }
     
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': (response) =>{ 
         this.sendotpEnables=false;
      }
    });
    this.windowRef.recaptchaVerifier.render();
  }

  sendLoginCode() {
    var appVerifier = this.windowRef.recaptchaVerifier;
    const num = this.phoneNumber.e164;
    firebase.auth().signInWithPhoneNumber(num, appVerifier)
      .then(result => {
        this.windowRef.confirmationResult = result;
      })
      .catch(error => console.log(error));
  }

  verifyLoginCode() {
    this.windowRef.confirmationResult
      .confirm(this.verificationCode)
      .then(result => {
        this.user = result.user;
        this.user.getIdToken().then(this.phoneauth.bind(this));
      })
      .catch(error => console.log(error, "Incorrect code entered?"))

  }

  phoneauth(result:string){
    this.authService.handlePhoneUser(this.user.phoneNumber,result);
    this.router.navigate(['/purchase-form']);
  }

  switchToPasswordAuth(){
    this.router.navigate(['/auth']);
  }
}
