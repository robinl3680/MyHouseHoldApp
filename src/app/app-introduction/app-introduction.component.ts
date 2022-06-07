import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-introduction',
  templateUrl: './app-introduction.component.html',
  styleUrls: ['./app-introduction.component.css'],
})
export class AppIntroductionComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}
  navigateToLogin() {
    this.router.navigate(['auth']);
  }
}
