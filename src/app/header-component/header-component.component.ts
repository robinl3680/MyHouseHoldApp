import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../app-auth/auth.service';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponent implements OnInit {

  userSubscription: Subscription;
  isAuthenticated = false;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe((userData)=>{
      this.isAuthenticated = userData ? true : false;
    });
  }

  onLogOut() {
    this.authService.onLogOut();
  }

}
