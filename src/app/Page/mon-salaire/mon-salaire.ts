import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-mon-salaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-salaire.html',
  styleUrl: './mon-salaire.css'
})
export class MonSalaireComponent implements OnInit {
  salaires: any[] = [];
  filteredSalaires: any[] = [];
  gestionRH: any[] = [];
  filteredGestionRH: any[] = [];
  idEmp: number = 0;

  filterSalaireAnnee: string = '';
  filterSalaireMois: string = '';
  filterRHAnnee: string = '';
  filterRHMois: string = '';

  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit() {
  this.idEmp = Number(this.authService.getIdEmp());

  this.http.get<any[]>('http://localhost:8080/salaireF')
    .subscribe((s: any[]) => {
      this.salaires = s.filter(x => Number(x.idEmp) === this.idEmp);
      this.applyFilters();
      this.cdr.detectChanges();
    });

  this.http.get<any[]>('http://localhost:8080/gestionrh')
    .subscribe((g: any[]) => {
      this.gestionRH = g.filter(x => Number(x.idEmp) === this.idEmp);
      this.applyRHFilters();
      this.cdr.detectChanges();
    });
}
  applyFilters() {
    this.filteredSalaires = this.salaires.filter(s => {
      const yearMatch = this.filterSalaireAnnee ? String(s.annee) === this.filterSalaireAnnee : true;
      const monthMatch = this.filterSalaireMois ? String(s.mois) === this.filterSalaireMois : true;
      return yearMatch && monthMatch;
    });
  }

  applyRHFilters() {
    this.filteredGestionRH = this.gestionRH.filter(g => {
      const yearMatch = this.filterRHAnnee ? String(g.annee) === this.filterRHAnnee : true;
      const monthMatch = this.filterRHMois ? String(g.mois) === this.filterRHMois : true;
      return yearMatch && monthMatch;
    });
  }

  getYears(list: any[]): number[] {
    return [...new Set(list.map(x => x.annee))].sort((a, b) => b - a);
  }
}