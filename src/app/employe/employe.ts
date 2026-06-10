import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Employe } from '../models/employe.model';
import { Poste } from '../models/poste.model';
import { LogService } from '../services/log';

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

  constructor(private http: HttpClient, private logService: LogService) {}

  ngOnInit() {
    this.loadEmployes();
    this.loadPostes();
    this.loadGestionRH();
  }

  loadEmployes() {
    this.http.get<Employe[]>('http://localhost:8080/employe')
      .subscribe((e: Employe[]) => this.employes = e);
  }

  loadPostes() {
    this.http.get<Poste[]>('http://localhost:8080/poste')
      .subscribe((p: Poste[]) => this.postes = p);
  }

  loadGestionRH() {
    this.http.get<any[]>('http://localhost:8080/gestionrh')
      .subscribe((g: any[]) => this.gestionRHList = g);
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
    this.http.patch(`http://localhost:8080/employe/${emp.idEmp}`, {
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
    this.http.post<Poste>('http://localhost:8080/poste', { titre: this.newEmploye.postetitre })
      .subscribe((poste: Poste) => {
        const employe = {
          nom: this.newEmploye.nom,
          prenom: this.newEmploye.prenom,
          salaireBase: this.newEmploye.salaireBase,
          idPoste: poste.idPoste
        };
        this.http.post<Employe>('http://localhost:8080/employe', employe)
          .subscribe((e: Employe) => {
            this.logService.add(`Employé ajouté: ${e.prenom} ${e.nom} (${this.newEmploye.postetitre})`);
            this.newEmploye = { nom: '', prenom: '', salaireBase: 0, postetitre: '' };
            this.loadEmployes();
            this.loadPostes();
          });
      });
  }

  deletePayroll(idEmp: number) {
  const emp = this.employes.find(e => e.idEmp === idEmp);
  const records = this.gestionRHList.filter(rh => rh.idEmp === idEmp);

  // Delete salaireF records first
  this.http.get<any[]>('http://localhost:8080/salaireF')
    .subscribe((sfList: any[]) => {
      const sfRecords = sfList.filter(s => s.idEmp === idEmp);
      Promise.all([
        ...sfRecords.map(s =>
          this.http.delete(`http://localhost:8080/salaireF/${s.idEmp}/${s.mois}/${s.annee}`).toPromise()
        ),
        ...records.map(rh =>
          this.http.delete(`http://localhost:8080/gestionrh/${rh.idPr}`).toPromise()
        )
      ]).then(() => {
        this.logService.add(`Fiches RH et salaires supprimés pour ${emp?.prenom} ${emp?.nom}`);
        this.loadGestionRH();
      });
    });
}

  deleteEmploye(id: number) {
    const emp = this.employes.find(e => e.idEmp === id);
    this.http.delete(`http://localhost:8080/employe/${id}`)
      .subscribe(() => {
        this.logService.add(`Employé supprimé: ${emp?.prenom} ${emp?.nom}`);
        this.loadEmployes();
      });
  }
}