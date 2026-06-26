import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { API_URL } from '../../environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const LOGO_BASE64 = 'data:image/jpeg;base64,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';

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