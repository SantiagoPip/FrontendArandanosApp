import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';

interface PrediccionResult {
  columna1: string;
  columna2: string;
  prediccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelPrediccionService {
  constructor(private http: HttpClient) {}
  testBackend(): Observable<any> {
    const url = 'http://127.0.0.1:5001';
    return this.http.get(url);
  }

  procesarArchivo(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    const url = 'http://127.0.0.1:5001/predict';
    console.log('Procesando archivo en el backend');

    // Configura para recibir un Blob
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al procesar el archivo';

        // Si el backend envía un mensaje de error en formato JSON
        if (error.status === 400 && error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            try {
              const errorResponse = JSON.parse(e.target.result);
              errorMessage = errorResponse.message || errorMessage;
            } catch (e) {
              console.error('Error al parsear el JSON del error');
            }
          };
          reader.readAsText(error.error);
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  descargarPredicciones(predicciones: PrediccionResult[]): void {
    const worksheet = XLSX.utils.json_to_sheet(predicciones);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Predicciones');
    XLSX.writeFile(workbook, 'predicciones.xlsx');
  }
}
