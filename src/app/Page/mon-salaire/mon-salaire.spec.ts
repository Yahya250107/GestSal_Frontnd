import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonSalaire } from './mon-salaire';

describe('MonSalaire', () => {
  let component: MonSalaire;
  let fixture: ComponentFixture<MonSalaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonSalaire],
    }).compileComponents();

    fixture = TestBed.createComponent(MonSalaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
