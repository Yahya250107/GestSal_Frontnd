import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './Page/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = false;
  isManager = false;
  isRH = false;
  isEmployee = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoggedIn = this.authService.isLoggedIn();
        this.isManager = this.authService.isManager();
        this.isRH = this.authService.isRH();
        this.isEmployee = this.authService.isEmployee();
      }
    });
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isManager = this.authService.isManager();
    this.isRH = this.authService.isRH();
    this.isEmployee = this.authService.isEmployee();
  }
}