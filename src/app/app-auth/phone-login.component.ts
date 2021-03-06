import { Component, OnInit } from '@angular/core';
import  firebase from 'firebase';
import { WindowService } from '../app-auth/window.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
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
  constructor(
    private win: WindowService,private router: Router
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
      'callback': function (response) {
        console.log(response);
      }
    });
    this.windowRef.recaptchaVerifier.render();
  }

  sendLoginCode() {
    // debugger;
    var appVerifier = this.windowRef.recaptchaVerifier;
    const num = this.phoneNumber.e164;
    firebase.auth().signInWithPhoneNumber(num, appVerifier)
      .then(result => {
        this.windowRef.confirmationResult = result;
      })
      .catch(error => console.log(error));
  }

  verifyLoginCode() {
    debugger;
    this.windowRef.confirmationResult
      .confirm(this.verificationCode)
      .then(result => {
        this.user = result.user;
        this.router.navigate(['/purchase-form']);
      })
      .catch(error => console.log(error, "Incorrect code entered?"))

  }
  switchToPasswordAuth(){
    this.router.navigate(['/auth']);
  }
}
