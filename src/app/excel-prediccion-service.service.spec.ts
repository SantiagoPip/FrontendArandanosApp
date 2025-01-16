import { TestBed } from '@angular/core/testing';

import { ExcelPrediccionServiceService } from './excel-prediccion-service.service';

describe('ExcelPrediccionServiceService', () => {
  let service: ExcelPrediccionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelPrediccionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
