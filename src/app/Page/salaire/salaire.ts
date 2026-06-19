import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
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
  totalSalaires = 0;

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

  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private logService: LogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  if (!isPlatformBrowser(this.platformId)) return;

  this.http.get<Employe[]>('http://localhost:8080/employe')
    .subscribe(e => {
      this.employes = e.filter(emp => emp.actif);
      if (this.employes.length > 0) this.form.idEmp = this.employes[0].idEmp;
      this.cdr.detectChanges();
    });
  this.http.get<Poste[]>('http://localhost:8080/poste')
    .subscribe(p => this.postes = p);
  this.loadSalaires();
}

  loadSalaires() {
    this.http.get<SalaireF[]>('http://localhost:8080/salaireF')
      .subscribe(s => {
        this.salaires = [...s];
        this.totalSalaires = this.salaires.reduce((sum, x) => sum + x.sf, 0);
        this.cdr.detectChanges();
      });
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

    this.http.get<any[]>('http://localhost:8080/gestionrh')
      .subscribe(rhList => {
        const existing = rhList.find(r =>
          r.idEmp === +this.form.idEmp &&
          r.mois === this.form.mois &&
          r.annee === this.form.annee
        );

        const request = existing
          ? this.http.patch(`http://localhost:8080/gestionrh/${existing.idPr}`, {
              heuresSupNormalSoir: String(this.form.heuresSupNormalSoir),
              heuresSupNormalNuit: String(this.form.heuresSupNormalNuit),
              heuresSupFerieSoir: String(this.form.heuresSupFerieSoir),
              heuresSupFerieNuit: String(this.form.heuresSupFerieNuit),
              heuresAbsence: String(this.form.heuresAbsence)
            })
          : this.http.post('http://localhost:8080/gestionrh', gestionRH);

        request.subscribe(() => {
          this.http.post(
            `http://localhost:8080/salaireF/calculer/${this.form.idEmp}/${this.form.mois}/${this.form.annee}`,
            {}
          ).subscribe(() => {
            this.logService.add(`Salaire calculé pour ${this.getName(+this.form.idEmp)}`);
            this.loadSalaires();
          });
        });
      });
  }

  deleteSalaire(idEmp: number, mois: number, annee: number) {
  // Delete salaireF
  this.http.delete(`http://localhost:8080/salaireF/${idEmp}/${mois}/${annee}`)
    .subscribe(() => {
      // Find and delete all gestionrh records for same employee/month/year
      this.http.get<any[]>('http://localhost:8080/gestionrh')
        .subscribe((rhList: any[]) => {
          const records = rhList.filter(r =>
            r.idEmp === idEmp &&
            r.mois === mois &&
            r.annee === annee
          );
          Promise.all(
            records.map(r =>
              this.http.delete(`http://localhost:8080/gestionrh/${r.idPr}`).toPromise()
            )
          ).then(() => {
            this.logService.add(`Fiche supprimée pour ${this.getName(idEmp)} — Mois ${mois}/${annee}`);
            this.loadSalaires();
          });
        });
    });
}
}