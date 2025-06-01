import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define interfaces for expected data structures (optional but good practice)
export interface UserData {
  home_address: string;
  supply_point: string;
  meter_serial_number: string;
  meter_location_description: string;
}

export interface WaterFact {
  id: number;
  title: string;
  quiz_question: string;
  quiz_options: string[];
  quiz_correct_answer: string;
  fact_title_after_answer: string;
  fact_description_after_answer: string;
}

export interface AssistanceRequest {
  request_type: string;
  user_identifier?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api'; // Assuming backend is served on the same domain

  constructor(private http: HttpClient) { }

  verifyCNumber(cNumber: string): Observable<UserData> {
    return this.http.post<UserData>(`${this.apiUrl}/verify_cnumber`, { c_number: cNumber })
      .pipe(catchError(this.handleError));
  }

  logAssistanceRequest(request: AssistanceRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/assistance_request`, request)
      .pipe(catchError(this.handleError));
  }

  getActiveWaterFact(): Observable<WaterFact> {
    return this.http.get<WaterFact>(`${this.apiUrl}/active_water_fact`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ApiService Error:', error);
    // Return an observable with a user-facing error message
    return throwError(() => new Error('Something bad happened; please try again later. Details: ' + error.message));
  }
}
