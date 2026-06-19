import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogService } from '../services/log';
import { AuthService } from '../services/auth';
import { API_URL } from '../../environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  isManager = false;
  isRH = false;
  isEmployee = false;

  constructor(public logService: LogService, private authService: AuthService) {}

  ngOnInit() {
    this.isManager = this.authService.isManager();
    this.isRH = this.authService.isRH();
    this.isEmployee = this.authService.isEmployee();
  }
}