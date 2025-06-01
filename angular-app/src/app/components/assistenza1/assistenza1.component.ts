import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute
import { ApiService, AssistanceRequest } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assistenza1',
  templateUrl: './assistenza1.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class Assistenza1Component {
  // Store c_number if available and needed for assistance requests
  // private cNumber: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute // To potentially get c_number
  ) {
    // this.cNumber = this.activatedRoute.snapshot.queryParamMap.get('c_number');
  }

  handleAssistanceOption(requestType: string): void {
    // This method will be called by the items in the list.
    // The main "Invia richiesta" button might need its own handler or be removed if options are direct.
    // For now, assuming each option click logs and navigates.
    this.logAndNavigate(requestType);
  }

  submitGenericRequest(): void {
    // This is for the main "Invia richiesta" button if it's meant to be generic
    // or if no specific option is chosen (though UI implies options are primary).
    // Let's assume it defaults to "Altro" or a generic request type.
    this.logAndNavigate("Altro - Richiesta Generica");
  }

  private logAndNavigate(requestType: string): void {
    const request: AssistanceRequest = {
      request_type: requestType,
      // user_identifier: this.cNumber || undefined // Example: pass c_number as user_identifier
    };

    this.apiService.logAssistanceRequest(request).subscribe({
      next: () => {
        console.log(\`Assistance request '${requestType}' logged.\`);
        this.router.navigate(['/assistenza2']);
      },
      error: (err) => {
        console.error('Failed to log assistance request:', err);
        this.router.navigate(['/assistenza2']);
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/home']); // Fallback to home
    }
  }
}
