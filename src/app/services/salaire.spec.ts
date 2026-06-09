import { TestBed } from '@angular/core/testing';

import { Salaire } from './salaire';

describe('Salaire', () => {
  let service: Salaire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Salaire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
