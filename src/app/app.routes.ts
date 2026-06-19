import { Routes } from '@angular/router';
import { SalaireComponent } from './Page/salaire/salaire';
import { DashboardComponent } from './Page/dashboard/dashboard';
import { EmployeComponent } from './Page/employe/employe';
import { LoginComponent } from './Page/login/login';
import { MonSalaireComponent } from './Page/mon-salaire/mon-salaire';
import { authGuard, managerGuard, rhGuard } from './Page/services/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'salaires', component: SalaireComponent, canActivate: [authGuard, rhGuard] },
  { path: 'employes', component: EmployeComponent, canActivate: [authGuard, managerGuard] },
  { path: 'mon-salaire', component: MonSalaireComponent, canActivate: [authGuard] },
];