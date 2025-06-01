import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, WaterFact } from '../../services/api.service';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // If it were to have forms

@Component({
  selector: 'app-riepilogo',
  templateUrl: './riepilogo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule] // CommonModule for directives
})
export class RiepilogoComponent implements OnInit {
  readingDetails: any = {};
  showWaterFacts: boolean = false;
  waterFactData: WaterFact | null = null; // Renamed to avoid conflict with potential template variable
  currentDateString: string = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.readingDetails = {
        address: params['homeAddress'] || 'N/A',
        reading: params['reading'] || 'N/A',
        supplyPoint: params['supplyPoint'] || 'N/A',
        meterSerialNumber: params['meterSerialNumber'] || 'N/A',
        date: this.currentDateString
      };
      this.showWaterFacts = params['waterFactAnswerChecked'] === 'true';

      // console.log("Riepilogo Params:", params);
      // console.log("Show Water Facts:", this.showWaterFacts);
    });

    if (this.showWaterFacts) {
      this.apiService.getActiveWaterFact().subscribe({
        next: (data) => {
          this.waterFactData = data;
          // console.log("WaterFact for Riepilogo:", this.waterFactData);
        },
        error: (err) => console.error('Failed to load water fact for riepilogo', err)
      });
    }
  }

  goHome(): void {
    // Need to consider how c_number is passed back or if Home can function without it
    // For now, just navigate to /home. If c_number is always required, this needs adjustment.
    this.router.navigate(['/home'], { queryParamsHandling: 'preserve' }); // Try to preserve c_number if it was there
  }
}
