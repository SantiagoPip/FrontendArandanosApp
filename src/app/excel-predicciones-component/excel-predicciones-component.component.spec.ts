import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelPrediccionesComponentComponent } from './excel-predicciones-component.component';

describe('ExcelPrediccionesComponentComponent', () => {
  let component: ExcelPrediccionesComponentComponent;
  let fixture: ComponentFixture<ExcelPrediccionesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExcelPrediccionesComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelPrediccionesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
