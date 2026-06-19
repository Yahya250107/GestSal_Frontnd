import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://gest-sal-frontnd.vercel.app/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string; role: string; idEmp: number }>(
      `${this.baseUrl}/login`, { username, password }
    );
  }

  saveSession(token: string, role: string, idEmp: number) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('idEmp', String(idEmp));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getIdEmp(): number {
    return Number(localStorage.getItem('idEmp'));
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isManager(): boolean {
    return this.getRole() === 'MANAGER';
  }

  isRH(): boolean {
    return this.getRole() === 'RH';
  }

  isEmployee(): boolean {
    return this.getRole() === 'EMPLOYEE';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}