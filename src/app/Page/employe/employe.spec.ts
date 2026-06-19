import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeComponent } from './employe';

describe('EmployeComponent', () => {
  let component: EmployeComponent;
  let fixture: ComponentFixture<EmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});