import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionInput {
  squareFeet: number;
  numBedrooms: number;
  numBathrooms: number;
  location: number;
  ageOfHouse: number;
  hasGarage: number;
  hasGarden: number;
  floor: number;
  buildingType: number;
}

export interface PredictionResponse {
  success: boolean;
  Predicted_Price?: number;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MLPredictionService {
  // Flask API URL - localhost:5000
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  predict(input: PredictionInput): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, input);
  }
}
