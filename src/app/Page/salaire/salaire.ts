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
import { API_URL } from '../../environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIALwAyAMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAAAQIFBgcIBAP/xABEEAABAwMBBAMKCwcFAQAAAAAAAQIDBAURBgcSITFBUWETFCJCVXF0gZKyFRYyNkVyhJHBw9EjJDWClKGxYpPS4fAX/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAEEBQIGA//EACcRAQACAgEDAgYDAAAAAAAAAAABAgMEEQUSITFBExUiMlFhQlKB/9oADAMBAAIRAxEAPwDeIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACABIIyMgSCMgCQAAAAAAAAAAAAAAAAAAAAAAhQJBGQBBTvp1kqaT1Vfrg7UdelPcKuKJsqsayOdzW8OHJF7D76+Cc9u2FXZ2YwREzDdmU6xlOs5++G7t5Urv6l/wCpUl7u3lSu/qH/AKlz5Xf8qXzWn9W/0cilRqfZ3eKuTULYKusnmZLE5qJLIrkynHp8ym1ylnwzht2yv6+eM9O6FQIB8VhIIJAAjiRlccwKgU5UnIEggZHIkAAAAAAAAgkgCCSAB8auZsFNLM/g1jFcvq4nOs0rp5pJXrlZHK5fWpvLXFX3npa4y72FWJWJ/N4P4mhsmv0uvrZjdUnm0VfVFJRT5opUimxyx5hedLVXemoaCRF5TNavmXh+Jvlq5RPMc4RyKxzXNXDmrlF7Toe3zpVUMFQ1cpLGjk9aGL1SsRaJbPSrTxar1AAymwEkEgUqYbTN1Slkitsm8tW+ma91wVzd5ng5cxUz8tHeCi8sceaYKNdbQqbSlQyjbTOqqx7N9W7241je1es8ejNptPqK5Mt1XRLSVEue5OSTfa9U44851DmYeml+Ob4HOdIyJzJEb3N8bVRzFdjLeHNG8eK8y6RSXlKqRlQ+u8GVWxqyGFY3s8VVXGU7fOZJup1GlL5tXvVNeauCiho2U0Mro2NexXOcjVxlcL2Dnn2Rx+2wpK3UNRHb4oaeanfutbWyvZHhFy1FVvHo8LoK7SupJbk99dM2Oljme1YnMb4bMqjVaqJnqU9+lLs6+6foro6NI31Ee85qckVFVOHZwLwiIhHKe1IAIdAAAAAARxJAEYAIVe0DA9rtX3Kww0yKiLPOnDrREVf84NRIdFXKz2+6oxLhSR1CR/I30zjJ4k0fp7yRS+waOru1wU44Zuzp3zX55aDRSpFQ318T9PeSKX2Cfihp/wAk0vsFj5nX8Ks9Mv8AloZFQ3joGr770tQuz8hixr52qqfgej4o6f8AJNL7BcaCgpLdB3CihZBFnO6xMJlSpt7lM9Y8LWpp3wW55etCSlFJKHLSSACRqva9pqhqZYry+6QUMytSJWzo5Wy445TdRVymehC17KdLW996S5fDNNWzUibzaen3+Crw3lV7UVefUevb9ysadH7x+WWPYfw1hMnHHecnvMO/PCPduK6ajs9pmSG5XKnppXJlGSPwuOs5ovEjJrvXyRPRzJKh7mqi5RUVyqbF2laHv9z1RU3G3Ui1dPUNbhWvblio1EwqKqdRrGeKSnnfDM3dkjcrXN58U4YFYRLeOz7VVgt+jbbSVt1poZ42PR8b3YVPCd+pknx40v5bpPbNDW3RWobpRR1lBbJJaeVFVkiPam9hVTr7D0f/ADzVnkWX/cZ/yI4gdD2+5Ulzp0qLfUx1EKrjfjdlM9R7DAdkunbpp+01kd2jSF88qPZDvI5UREwq8FwZ8cugAAAAABB56ysho6d9RUysiiYmXPcuERBHnxCJmI9X1e9sbFc9URqcVVVwmDVGvNobplkttglVrOUtU3gq9jf1LTrnXk18e6htznw29F4u5Om7exOwwg1dXS8d92bs7c/bVvnZzqL4dsTGTvRa2m8CZF5u6netP7opluDnfRl/l09fYarwu93r3OdvWxV4r6l4nQkMzZ42SxORzHojmuTkqLyUqbeH4V/HpKzq5u+nE+sPqACqtIzgxu/16ulbBC9URnFyovSXi51aUdM5/jLwanaYc5Vc5XOXKrzUwesbs46/DpPmV7Tw9891vRkdqvCTYiqnI2Tod0O/7L0hgKcORfLVeHMxDVO4eK9fxPl03q3dxjzT/rrZ1OPqoyQFDX7zctVFReonPaeiiYmOYZ/6ak2/fQX2j8ssexD54y+hye8wvm376C+0fllj2IfPGX0OT3mH0/i592+MIcqX1MXy4+lS+8p1Ycp37+OXH0qX3lIqmXQOy5E+Idp+o/33GVGLbLvmHafqP99xlRylGEJAAAAAAAPNWVCUtJLUPRzmxMV6o1uVXCZ4GgtY6xrdSVCtXMFCxfAgTp7XdeToRWoqYwaC2l6cSxXx0sDMUVWqyRKicGO6W/8AugvaPZ8T6o8qe33dvj0Yoikop80UqRTaZEvpk29sl1H31Rvs1U/9tTpvQ58aPpT1fj2GnkU91nuU9oucFbSuxLC9HImeDk6U9fH7yvs4oy4+IfbBknHfl02Qq45qeGzXKG7W2nrqZ29HM1HJ2L1Hk1FXrTUvco1/aycE7EPNZ8kYaTM+zfxVnLMRHus16r++qtWtX9mzgnavWeFHHxauCtFPD7F5y3m0+70WPHFKRV9UBSjiclTiTj8r1ZK6ZkrIFy9irhOtDJSyaeotyNah/wAp/wAnsQvh7XpVclcEfElhbM1nJ9LUe376C+0fllj2IfPGX0OT3mGS7c7fW1lPaKilppZo4XTNkWNu9u725u8O3dUsuxO2Vseo6islpZY4G0rmb72KiK5XN4cfMa38Vb3buOU79/HLj6VL7ynVhzDqezXKn1BcI5KKoRVqHq1yRqqORXKuUVCKJb02XfMO0/Uf77jKjG9nlJPQ6MtdNVRujmbEquY5OLcuVeP3mSHKQAAAAAAAEFg1lYI9Q2OeiXCTY34Xr4r05epeRkBTuk1mazzDm1YtHEuVZon080kMzFZLG5WuYqfJVOaFO8iJnoN0av2b/Dt+SupauOljlb+8Ju7yq5OSonaXKybN9P2tEfLA6tmTx6h28nspw+9DWjepFfLMnTtNmlrZZrldn7ltop5/9TG+Cn8y8E9amc2bZRXTYku1XHTt6YoU33eteSf3NvwwRQRpHDGyNjeTWphEPpgrZN/Jb08LFNKlfVaNOWKk09Qd5ULpVj3levdH7yqq/wCOR97haqavVHTNXfRMNci8i4YIwZ+WkZYmLrtPo+1ilVpqePK00iPTqdwUtM9LUUy4mic3zobCwhQ+Jj0w9qKnUqGVm6Riv5p4lex7+Sv3eWvUXqPba6V1bUtZjwE4vXsMhq7DRT8WMWN3WxT72m2tt8bkR285y5VxRxdIvXNHd6Pvl3q2xzFfV7WNRrUa1MIhWMEnpIjiOGUjdQbqEgkCMISAI3UznHEkAAAAAAAAAAAAKcIMFRGAJAAAAAAABTgYKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//Z';

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
  filterEmploye: string = '';

  reportMois: number = new Date().getMonth() + 1;
  reportAnnee: number = new Date().getFullYear();

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

    this.http.get<Employe[]>(`${API_URL}/employe`)
      .subscribe(e => {
        this.employes = e.filter(emp => emp.actif);
        if (this.employes.length > 0) this.form.idEmp = this.employes[0].idEmp;
        this.cdr.detectChanges();
      });
    this.http.get<Poste[]>(`${API_URL}/poste`)
      .subscribe(p => this.postes = p);
    this.loadSalaires();
  }

  loadSalaires() {
    this.http.get<SalaireF[]>(`${API_URL}/salaireF`)
      .subscribe(s => {
        this.salaires = [...s];
        this.cdr.detectChanges();
      });
  }

  get filteredSalaires(): SalaireF[] {
    if (!this.filterEmploye) return this.salaires;
    return this.salaires.filter(s => s.idEmp === +this.filterEmploye);
  }

  getTotalSalaires(): number {
    return this.filteredSalaires.reduce((sum, x) => sum + x.sf, 0);
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

    this.http.get<any[]>(`${API_URL}/gestionrh`)
      .subscribe(rhList => {
        const existing = rhList.find(r =>
          r.idEmp === +this.form.idEmp &&
          r.mois === this.form.mois &&
          r.annee === this.form.annee
        );

        const request = existing
          ? this.http.patch(`${API_URL}/gestionrh/${existing.idPr}`, {
              heuresSupNormalSoir: String(this.form.heuresSupNormalSoir),
              heuresSupNormalNuit: String(this.form.heuresSupNormalNuit),
              heuresSupFerieSoir: String(this.form.heuresSupFerieSoir),
              heuresSupFerieNuit: String(this.form.heuresSupFerieNuit),
              heuresAbsence: String(this.form.heuresAbsence)
            })
          : this.http.post(`${API_URL}/gestionrh`, gestionRH);

        request.subscribe(() => {
          this.http.post(
            `${API_URL}/salaireF/calculer/${this.form.idEmp}/${this.form.mois}/${this.form.annee}`,
            {}
          ).subscribe(() => {
            this.logService.add(`Salaire calculé pour ${this.getName(+this.form.idEmp)}`);
            this.loadSalaires();
          });
        });
      });
  }

  deleteSalaire(idEmp: number, mois: number, annee: number) {
    this.http.delete(`${API_URL}/salaireF/${idEmp}/${mois}/${annee}`)
      .subscribe(() => {
        this.http.get<any[]>(`${API_URL}/gestionrh`)
          .subscribe((rhList: any[]) => {
            const records = rhList.filter(r =>
              r.idEmp === idEmp &&
              r.mois === mois &&
              r.annee === annee
            );
            Promise.all(
              records.map(r =>
                this.http.delete(`${API_URL}/gestionrh/${r.idPr}`).toPromise()
              )
            ).then(() => {
              this.logService.add(`Fiche supprimée pour ${this.getName(idEmp)} — Mois ${mois}/${annee}`);
              this.loadSalaires();
            });
          });
      });
  }

  generateMonthlyReportPDF() {
    const doc = new jsPDF();
    doc.addImage(LOGO_BASE64, 'JPEG', 165, 10, 30, 30);
    const salairesFiltres = this.salaires.filter(
      s => s.mois === this.reportMois && s.annee === this.reportAnnee
    );

    doc.setFontSize(18);
    doc.text('Rapport de Paie Mensuel', 14, 20);

    doc.setFontSize(11);
    doc.text(`Mois: ${this.reportMois}/${this.reportAnnee}`, 14, 30);
    doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 36);

    autoTable(doc, {
      startY: 45,
      head: [['Employé', 'Poste', 'Salaire final']],
      body: salairesFiltres.map(s => [
        this.getName(s.idEmp),
        this.getPoste(s.idEmp),
        `${s.sf.toFixed(2)} MAD`
      ]),
    });

    const total = salairesFiltres.reduce((sum, s) => sum + s.sf, 0);
    const finalY = (doc as any).lastAutoTable.finalY || 60;

    doc.setFontSize(13);
    doc.text(`Total: ${total.toFixed(2)} MAD`, 14, finalY + 15);

    doc.save(`rapport-paie-${this.reportMois}-${this.reportAnnee}.pdf`);
  }
  
}