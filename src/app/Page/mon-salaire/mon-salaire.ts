import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { API_URL } from '../../environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  this.http.get<any[]>(`${API_URL}/salaireF`)
    .subscribe((s: any[]) => {
      this.salaires = s.filter(x => Number(x.idEmp) === this.idEmp);
      this.applyFilters();
      this.cdr.detectChanges();
    });

  this.http.get<any[]>(`${API_URL}/gestionrh`)
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
  generatePDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Fiche de Paie', 14, 20);

  doc.setFontSize(11);
  doc.text(`Employé ID: ${this.idEmp}`, 14, 30);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 36);

  autoTable(doc, {
    startY: 45,
    head: [['Mois', 'Année', 'Salaire final']],
    body: this.filteredSalaires.map(s => [s.mois, s.annee, `${s.sf.toFixed(2)} MAD`]),
  });

  const finalY = (doc as any).lastAutoTable.finalY || 60;

  doc.setFontSize(13);
  doc.text('Pointage', 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Mois', 'Année', 'Sup. Soir', 'Sup. Nuit', 'Férié Soir', 'Férié Nuit', 'Absences']],
    body: this.filteredGestionRH.map(g => [
      g.mois, g.annee,
      g.heuresSupNormalSoir, g.heuresSupNormalNuit,
      g.heuresSupFerieSoir, g.heuresSupFerieNuit,
      g.heuresAbsence
    ]),
  });

  doc.save(`fiche-paie-${this.idEmp}.pdf`);
}
}