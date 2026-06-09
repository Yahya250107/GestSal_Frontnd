import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Salaire } from './salaire';

describe('Salaire', () => {
  let component: Salaire;
  let fixture: ComponentFixture<Salaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Salaire],
    }).compileComponents();

    fixture = TestBed.createComponent(Salaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
