import { Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { ExcelPrediccionService } from '../excel-prediccion-service.service';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-excel-predicciones',
  templateUrl: './excel-predicciones-component.component.html',
  styleUrls: ['./excel-predicciones-component.component.css']
})
export class ExcelPrediccionesComponent {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;

  selectedFile: File | null = null;
  errorMessage: string = '';
  tableData: any[] = [];
  tableHeaders: string[] = [];
  filteredTableData: any[] = []; // Para la tabla filtrada
  downloadableFile: Blob | null = null;
  chart: Chart | null = null;
  showChart: boolean = true; // Nueva propiedad para controlar la visualización

  constructor(private excelService: ExcelPrediccionService) {
    // Registrar los componentes de Chart.js
    Chart.register(...registerables);
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      const validFormats = ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidFormat = validFormats.some(format => fileName.endsWith(format));

      if (isValidFormat) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.selectedFile = null;
        this.errorMessage = 'Formato de archivo inválido. Solo se aceptan archivos .xlsx o .xls';
        this.showCustomErrorPopup();
      }
    }
  }

  uploadAndPredict(): void {

    if (this.selectedFile) {
      this.excelService.procesarArchivo(this.selectedFile).subscribe({
        next: (response: Blob) => {
          this.downloadableFile = response;

          const reader = new FileReader();
          reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
              this.tableHeaders = jsonData[0] as string[];
              this.tableData = jsonData.slice(1);

              // Filtrar columnas para la tabla (solo "Semana" y "Predicciones")
              const semanaIndex = this.tableHeaders.indexOf('Semana');
              const prediccionesIndex = this.tableHeaders.indexOf('Predicciones');

              if (semanaIndex !== -1 && prediccionesIndex !== -1) {
                this.filteredTableData = this.tableData.map(row => [
                  row[semanaIndex],
                  row[prediccionesIndex]
                ]);

                if (this.filteredTableData.length > 0) {
                  setTimeout(() => {
                    this.createChart(
                      this.filteredTableData.map(row => row[0]), // Labels
                      this.filteredTableData.map(row => row[1])  // Data
                    );
                  }, 0);
                }
              }
            }
          };
          reader.readAsArrayBuffer(response);

          Swal.fire({
            icon: 'success',
            title: 'Predicción Exitosa',
            text: 'El archivo con predicciones se ha procesado correctamente.',
            confirmButtonText: 'Aceptar'
          });
        },

        error: (error) => {
          console.error('Error al procesar archivo', error);
          this.errorMessage = error.message;
          this.showCustomErrorPopup();
        },
      });
    }
  }
 // Método para cambiar entre vista de gráfica y tabla
 toggleView(): void {
  this.showChart = !this.showChart;
  if (this.showChart && this.filteredTableData.length > 0) {
    // Necesitamos volver a crear la gráfica cuando cambiamos a su vista
    setTimeout(() => {
      this.createChart(
        this.filteredTableData.map(row => row[0]),
        this.filteredTableData.map(row => row[1])
      );
    }, 0);
  }
}
  createChart(labels: any[], data: any[]): void {
    // Destruir gráfica previa si existe
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Validar que el canvas está disponible
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('El elemento canvas no está disponible.');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas.');
      return;
    }

    // Filtrar y convertir datos
    const validLabels = labels.filter(label => label !== undefined && label !== null);
    const validData = data
      .map(value => {
        if (typeof value === 'string') {
          // Eliminar corchetes y convertir a número
          const cleanedValue = value.replace(/[\[\]]/g, '').trim();
          return parseFloat(cleanedValue);
        }
        if (Array.isArray(value)) {
          // Si el valor es un array como [34.21121], toma el primer elemento
          return parseFloat(value[0]);
        }
        return parseFloat(value);
      })
      .filter(value => !isNaN(value)); // Filtrar valores no numéricos

    console.log('Labels procesados:', validLabels);
    console.log('Datos procesados:', validData);

    // Verificar que haya datos válidos
    if (validLabels.length === 0 || validData.length === 0) {
      console.error('No hay datos válidos para crear la gráfica.');
      return;
    }

    // Crear gráfica
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: validLabels,
        datasets: [
          {
            label: 'Predicciones',
            data: validData,
            borderColor: '#3e95cd',
            backgroundColor: 'rgba(62, 149, 205, 0.4)',
            fill: true,
            tension: 0.4 // Suavizar la línea
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Semana'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Predicciones'
            }
          }
        }
      }
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  }

  downloadPredictions(): void {
    if (this.downloadableFile) {
      const blobUrl = URL.createObjectURL(this.downloadableFile);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'predicciones.xlsx';
      a.click();
      URL.revokeObjectURL(blobUrl);
    }
  }

  showCustomErrorPopup(): void {
    Swal.fire({
      icon: 'error',
      title: '¡Error!',
      text: this.errorMessage,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
      background: '#f8d7da',
      color: '#721c24',
      iconColor: '#dc3545',
    });
  }
}
