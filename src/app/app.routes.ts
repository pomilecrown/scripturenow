import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'training', loadComponent: () => import('./features/training/training.component').then(m => m.TrainingComponent) },
  { path: 'results', loadComponent: () => import('./features/results/results.component').then(m => m.ResultsComponent) },
  { path: 'history', loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent) },
  { path: '**', redirectTo: '' }
];
