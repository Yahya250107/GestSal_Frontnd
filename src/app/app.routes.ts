import { Routes } from '@angular/router';
import { SalaireComponent } from './salaire/salaire';
import { DashboardComponent } from './dashboard/dashboard';
import { EmployeComponent } from './employe/employe';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'salaires', component: SalaireComponent },
  { path: 'employes', component: EmployeComponent },
];