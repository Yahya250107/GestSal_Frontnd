import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Employe } from '../models/employe.model';
import { GestionRH } from '../models/gesstion-rh.model';
import { SalaireF } from '../models/salaire-f.model';
import { Poste } from '../models/poste.model';
import { LogService } from '../services/log';

@Component({
  selector: 'app-salaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salaire.html',
  styleUrl: './salaire.css'
})
export class SalaireComponent implements OnInit {
  employes: Employe[] = [];
  gestionRHList: GestionRH[] = [];
  salaires: SalaireF[] = [];
  postes: Poste[] = [];

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

  constructor(private http: HttpClient, private logService: LogService) {}

  ngOnInit() {
    this.http.get<Employe[]>('http://localhost:8080/employe')
      .subscribe((e: Employe[]) => {
        this.employes = e;
        if (e.length > 0) this.form.idEmp = e[0].idEmp;
      });
    this.http.get<Poste[]>('http://localhost:8080/poste')
      .subscribe((p: Poste[]) => this.postes = p);
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
          this.logService.add(`Salaire calculé pour ${this.getName(this.form.idEmp)} — Mois ${this.form.mois}/${this.form.annee}`);
          this.loadSalaires();
        });
      });
  }

  deleteSalaire(idEmp: number, mois: number, annee: number) {
    this.http.delete(`http://localhost:8080/salaireF/${idEmp}/${mois}/${annee}`)
      .subscribe(() => {
        this.http.get<any[]>('http://localhost:8080/gestionrh')
          .subscribe((rhList: any[]) => {
            const rh = rhList.find(r => r.idEmp === idEmp && r.mois === mois && r.annee === annee);
            if (rh) {
              this.http.delete(`http://localhost:8080/gestionrh/${rh.idPr}`)
                .subscribe(() => {
                  this.logService.add(`Fiche supprimée pour ${this.getName(idEmp)} — Mois ${mois}/${annee}`);
                  this.loadSalaires();
                });
            } else {
              this.loadSalaires();
            }
          });
      });
  }

  getCalcule(idEmp: number, mois: number, annee: number): number {
    const emp = this.employes.find(e => e.idEmp === idEmp);
    const rh = this.gestionRHList.find(
      r => r.idEmp === idEmp && r.mois === mois && r.annee === annee
    );
    if (!emp || !rh) return 0;
    const tauxH = emp.salaireBase / 192;
    return +(
      emp.salaireBase
      + rh.heuresSupNormalSoir * tauxH * 1.25
      + rh.heuresSupNormalNuit * tauxH * 1.50
      + rh.heuresSupFerieSoir  * tauxH * 1.50
      + rh.heuresSupFerieNuit  * tauxH * 2.00
      - rh.heuresAbsence       * tauxH
    ).toFixed(2);
  }

  getName(idEmp: number): string {
    const emp = this.employes.find(e => e.idEmp === idEmp);
    return emp ? emp.prenom + ' ' + emp.nom : 'Inconnu';
  }

  getPoste(idEmp: number): string {
    const emp = this.employes.find(e => e.idEmp === idEmp);
    if (!emp) return '';
    const poste = this.postes.find(p => p.idPoste === emp.idPoste);
    return poste ? poste.titre : '';
  }

  getTotalSalaires(): number {
    return this.salaires.reduce((sum, s) => sum + s.sf, 0);
  }
}