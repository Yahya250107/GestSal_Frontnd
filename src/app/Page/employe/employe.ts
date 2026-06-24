import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Employe } from '../models/employe.model';
import { Poste } from '../models/poste.model';
import { LogService } from '../services/log';
import { API_URL } from '../../environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-employe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employe.html',
  styleUrl: './employe.css'
})
export class EmployeComponent implements OnInit {
  employes: Employe[] = [];
  postes: Poste[] = [];
  editingId: number | null = null;
  editSalaire: number = 0;
  gestionRHList: any[] = [];

  newEmploye = {
    nom: '',
    prenom: '',
    salaireBase: 0,
    postetitre: ''
  };

  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private logService: LogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadEmployes();
    this.loadPostes();
    this.loadGestionRH();
  }

  loadEmployes() {
    this.http.get<Employe[]>(`${API_URL}/employe/all`)
      .subscribe((e: Employe[]) => {
        this.employes = e;
        this.cdr.detectChanges();
      });
  }

  loadPostes() {
    this.http.get<Poste[]>(`${API_URL}/poste`)
      .subscribe((p: Poste[]) => {
        this.postes = p;
        this.cdr.detectChanges();
      });
  }

  loadGestionRH() {
    this.http.get<any[]>(`${API_URL}/gestionrh`)
      .subscribe((g: any[]) => {
        this.gestionRHList = g;
        this.cdr.detectChanges();
      });
  }

  getPosteTitle(idPoste: number): string {
    const poste = this.postes.find(p => p.idPoste === idPoste);
    return poste ? poste.titre : '';
  }

  hasPayroll(idEmp: number): boolean {
    return this.gestionRHList.some(rh => rh.idEmp === idEmp);
  }

  startEdit(emp: Employe) {
    this.editingId = emp.idEmp;
    this.editSalaire = emp.salaireBase;
  }

  saveEdit(emp: Employe) {
    this.http.patch(` ${API_URL}/employe/${emp.idEmp}`, {
      salaireBase: String(this.editSalaire)
    }).subscribe(() => {
      this.logService.add(`Salaire de ${emp.prenom} ${emp.nom} modifié → ${this.editSalaire} MAD`);
      this.editingId = null;
      this.loadEmployes();
    });
  }

  cancelEdit() {
    this.editingId = null;
  }

  addEmploye() {
  // Validation
  if (
    !this.newEmploye.nom.trim() ||
    !this.newEmploye.prenom.trim() ||
    !this.newEmploye.postetitre.trim() ||
    !this.newEmploye.salaireBase
  ) {
    alert("Veuillez remplir tous les champs avant d'ajouter un employé.");
    return;
  }

  this.http.post<Poste>(`${API_URL}/poste`, { titre: this.newEmploye.postetitre })
    .subscribe((poste: Poste) => {
      const employe = {
        nom: this.newEmploye.nom,
        prenom: this.newEmploye.prenom,
        salaireBase: this.newEmploye.salaireBase,
        idPoste: poste.idPoste
      };

      this.http.post<Employe>(`${API_URL}/employe`, employe)
        .subscribe((e: Employe) => {
          const username = this.newEmploye.nom.toLowerCase() + Date.now().toString().slice(-3);
          const password = this.newEmploye.prenom.toLowerCase() + '123';

          this.logService.add(
            `Employé ajouté: ${e.prenom} ${e.nom} — Login: ${username} / ${password}`
          );

          this.newEmploye = {
            nom: '',
            prenom: '',
            salaireBase: 0,
            postetitre: ''
          };

          this.http.post(`${API_URL}/auth/register`, {
            username,
            password,
            role: 'EMPLOYEE',
            idEmp: String(e.idEmp)
          }).subscribe();

          setTimeout(() => {
            this.loadEmployes();
            this.loadPostes();
            this.cdr.detectChanges();
          }, 500);
        });
    });
}
  desactiver(id: number) {
    const emp = this.employes.find(e => e.idEmp === id);
    this.http.patch(` ${API_URL}/employe/${id}/desactiver`, {})
      .subscribe(() => {
        this.logService.add(`Employé désactivé: ${emp?.prenom} ${emp?.nom}`);
        this.loadEmployes();
        this.cdr.detectChanges();
      });
  }

  reactiver(id: number) {
    const emp = this.employes.find(e => e.idEmp === id);
    this.http.patch(` ${API_URL}/employe/${id}/reactiver`, {})
      .subscribe(() => {
        this.logService.add(`Employé réactivé: ${emp?.prenom} ${emp?.nom}`);
        this.loadEmployes();
        this.cdr.detectChanges();
      });
  }

  deletePayroll(idEmp: number) {
    const emp = this.employes.find(e => e.idEmp === idEmp);
    const records = this.gestionRHList.filter(rh => rh.idEmp === idEmp);
    this.http.get<any[]>(`${API_URL}/salaireF`)
      .subscribe((sfList: any[]) => {
        const sfRecords = sfList.filter(s => s.idEmp === idEmp);
        Promise.all([
          ...sfRecords.map(s =>
            this.http.delete(` ${API_URL}/salaireF/${s.idEmp}/${s.mois}/${s.annee}`).toPromise()
          ),
          ...records.map(rh =>
            this.http.delete(` ${API_URL}/gestionrh/${rh.idPr}`).toPromise()
          )
        ]).then(() => {
          this.logService.add(`Fiches RH et salaires supprimés pour ${emp?.prenom} ${emp?.nom}`);
          this.loadGestionRH();
          this.cdr.detectChanges();
        });
      });
  }

  deleteEmploye(id: number) {
  const emp = this.employes.find(e => e.idEmp === id);

  if (!confirm(`Voulez-vous vraiment supprimer ${emp?.prenom} ${emp?.nom} ? Cette action est irréversible.`)) {
    return;
  }

  this.http.delete(`${API_URL}/employe/${id}/user`)
    .subscribe(() => {
      this.logService.add(`Employé supprimé: ${emp?.prenom} ${emp?.nom}`);
      this.loadEmployes();
      this.cdr.detectChanges();
    });
}
generateBaseSalaryReportPDF() {
  const doc = new jsPDF();
  const activeEmployes = this.employes.filter(e => e.actif);

  doc.setFontSize(18);
  doc.text('Liste des Employés - Salaire de Base', 14, 20);

  doc.setFontSize(11);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Employé', 'Poste', 'Salaire de base']],
    body: activeEmployes.map(e => [
      `${e.prenom} ${e.nom}`,
      this.getPosteTitle(e.idPoste),
      `${e.salaireBase.toFixed(2)} MAD`
    ]),
  });

  const total = activeEmployes.reduce((sum, e) => sum + e.salaireBase, 0);
  const finalY = (doc as any).lastAutoTable.finalY || 60;

  doc.setFontSize(13);
  doc.text(`Total: ${total.toFixed(2)} MAD`, 14, finalY + 15);

  doc.save(`employes-salaire-base.pdf`);
}  
}