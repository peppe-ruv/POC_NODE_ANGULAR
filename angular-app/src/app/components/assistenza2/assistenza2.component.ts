import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor


@Component({
  selector: 'app-assistenza2',
  templateUrl: './assistenza2.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class Assistenza2Component {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  goBack(): void {
    // Navigate to assistenza1, preserving c_number if it was in query params
    this.router.navigate(['/assistenza1'], { queryParamsHandling: 'preserve' });
  }
}
