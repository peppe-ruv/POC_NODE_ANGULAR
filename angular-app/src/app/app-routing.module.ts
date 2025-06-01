import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Assistenza1Component } from './components/assistenza1/assistenza1.component';
import { Assistenza2Component } from './components/assistenza2/assistenza2.component';
import { RiepilogoComponent } from './components/riepilogo/riepilogo.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'assistenza1', component: Assistenza1Component },
  { path: 'assistenza2', component: Assistenza2Component },
  { path: 'riepilogo', component: RiepilogoComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  // { path: '**', redirectTo: '/home' } // Wildcard route for 404s (optional)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
