import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Employe } from './employe';

describe('Employe', () => {
  let component: Employe;
  let fixture: ComponentFixture<Employe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employe],
    }).compileComponents();

    fixture = TestBed.createComponent(Employe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
