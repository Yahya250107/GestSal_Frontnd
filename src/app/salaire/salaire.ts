import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Employe } from '../models/employe.model';
import { GestionRH } from '../models/gesstion-rh.model';
import { SalaireF } from '../models/salaire-f.model';

@Component({
  selector: 'app-salaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salaire.html',
  styleUrl: './salaire.css'
})
export class SalaireComponent implements OnInit {
  employes: Employe[] = [];
  salaires: SalaireF[] = [];

  form = {
    idEmp: 0,
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    heuresSupNormalSoir: 0,
    heuresSupNormalNuit: 0,
    heuresSupFerieSoir: 0,
    heuresSupFerieNuit: 0,
    heuresAbsence: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Employe[]>('http://localhost:8080/employe')
      .subscribe((e: Employe[]) => {
        this.employes = e;
        if (e.length > 0) this.form.idEmp = e[0].idEmp;
      });
    this.loadSalaires();
  }

  loadSalaires() {
    this.http.get<SalaireF[]>('http://localhost:8080/salaireF')
      .subscribe((s: SalaireF[]) => this.salaires = s);
  }

  applyPayroll() {
    const gestionRH: GestionRH = {
      idPr: 0,
      idEmp: +this.form.idEmp,
      mois: this.form.mois,
      annee: this.form.annee,
      heuresSupNormalSoir: this.form.heuresSupNormalSoir,
      heuresSupNormalNuit: this.form.heuresSupNormalNuit,
      heuresSupFerieSoir: this.form.heuresSupFerieSoir,
      heuresSupFerieNuit: this.form.heuresSupFerieNuit,
      heuresAbsence: this.form.heuresAbsence
    };

    this.http.post('http://localhost:8080/gestionrh', gestionRH)
      .subscribe(() => {
        this.http.post(
          `http://localhost:8080/salaireF/calculer/${this.form.idEmp}/${this.form.mois}/${this.form.annee}`,
          {}
        ).subscribe(() => {
          this.loadSalaires();
        });
      });
  }

  getName(idEmp: number): string {
    const emp = this.employes.find(e => e.idEmp === idEmp);
    return emp ? emp.prenom + ' ' + emp.nom : 'Inconnu';
  }
}