import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // For RouterOutlet

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule] // Import RouterModule for RouterOutlet
})
export class AppComponent {
  title = 'contatori-app';
}
