import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExcelPrediccionesComponent } from './excel-predicciones-component/excel-predicciones-component.component';
import { ResultsComponent } from './results/results.component';

const routes: Routes = [
  { path: '', component: ExcelPrediccionesComponent },
  { path: 'results', component: ResultsComponent }, // Definir ruta para la nueva página
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
