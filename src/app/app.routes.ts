import { Routes } from '@angular/router';
import { SalaireComponent } from './salaire/salaire';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'salaires', component: SalaireComponent },
];