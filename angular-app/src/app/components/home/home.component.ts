import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, UserData, WaterFact } from '../../services/api.service';
import { FormsModule } from '@angular/forms'; // Ensure FormsModule is imported if using ngModel directly in template
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.css'], // Add if you have specific styles
  standalone: true, // Starting with Angular 17, components can be standalone
  imports: [FormsModule, CommonModule] // Import FormsModule and CommonModule for standalone components
})
export class HomeComponent implements OnInit {
  cNumber: string | null = null;
  userData: UserData | null = null;
  waterFact: WaterFact | null = null;
  errorMessage: string | null = null;

  // Form fields bound with ngModel
  homeAddress: string = '';
  supplyPoint: string = '';
  meterSerialNumber: string = '';
  meterLocationDescription: string = '';
  reading: string = ''; // This is a mandatory field

  selectedWaterFactAnswer: string = ''; // Initialize to prevent issues with radio buttons
  waterFactAnswerChecked: boolean = false;
  isWaterFactAnswerCorrect: boolean | null = null;

  // For enabling/disabling submit button
  get isFormValid(): boolean {
    return !!this.homeAddress && !!this.reading; // Mandatory fields
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.cNumber = this.route.snapshot.queryParamMap.get('c_number');
    if (this.cNumber) {
      this.apiService.verifyCNumber(this.cNumber).subscribe({
        next: (data) => {
          this.userData = data;
          this.homeAddress = data.home_address || '';
          this.supplyPoint = data.supply_point || '';
          this.meterSerialNumber = data.meter_serial_number || '';
          this.meterLocationDescription = data.meter_location_description || '';
        },
        error: (err) => {
          this.errorMessage = 'Failed to verify c_number or load user data. ' + err.message;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'c_number not found in URL.';
    }
    this.loadWaterFact();
  }

  loadWaterFact(): void {
    this.apiService.getActiveWaterFact().subscribe({
      next: (data) => {
        this.waterFact = data;
        // Ensure selectedWaterFactAnswer is reset if a new fact is loaded (e.g. polling)
        // this.selectedWaterFactAnswer = '';
      },
      error: (err) => {
        this.errorMessage = (this.errorMessage ? this.errorMessage + '\n' : '') + 'Failed to load water fact. ' + err.message;
        console.error(err);
      }
    });
  }

  checkWaterFactAnswer(): void {
    if (this.selectedWaterFactAnswer && this.waterFact) {
      this.waterFactAnswerChecked = true;
      this.isWaterFactAnswerCorrect = this.selectedWaterFactAnswer === this.waterFact.quiz_correct_answer;
    } else {
      // alert("Please select an answer for the water fact quiz.");
    }
  }

  submitReading(): void {
    if (!this.isFormValid) {
        alert('Indirizzo di casa e Lettura sono campi obbligatori.');
        return;
    }

    this.router.navigate(['/riepilogo'], {
      queryParams: {
        homeAddress: this.homeAddress,
        reading: this.reading,
        supplyPoint: this.supplyPoint,
        meterSerialNumber: this.meterSerialNumber,
        // Pass other relevant data as needed
        waterFactAnswerChecked: this.waterFactAnswerChecked,
        // c_number: this.cNumber // If Riepilogo needs to know the original c_number
      }
    });
  }

  skipAndSubmit(): void {
    if (!this.isFormValid) {
        alert('Indirizzo di casa e Lettura sono campi obbligatori.');
        return;
    }
    this.waterFactAnswerChecked = false; // Explicitly set as skipped for Riepilogo logic
    this.submitReading(); // submitReading already contains validation and navigation
  }

  // Placeholder for the third button if it has specific logic
  handleInfoButton(): void {
    // console.log("Info button clicked");
    // Potentially navigate to an info page or show a modal
  }
}
