import { Routes } from '@angular/router';
import { Inventory } from './inventory/inventory';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'inventory', component: Inventory }
];