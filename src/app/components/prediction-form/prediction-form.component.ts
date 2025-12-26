import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MLPredictionService, PredictionInput } from '../../services/ml-prediction.service';

@Component({
  selector: 'app-prediction-form',
  templateUrl: './prediction-form.component.html',
  styleUrls: ['./prediction-form.component.css']
})
export class PredictionFormComponent implements OnInit {
  predictionForm: FormGroup;
  predictionResult: number | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private mlService: MLPredictionService
  ) {
    this.predictionForm = this.fb.group({
      squareFeet: ['', [Validators.required, Validators.min(0)]],
      numBedrooms: ['', [Validators.required, Validators.min(0)]],
      numBathrooms: ['', [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required, Validators.min(0)]],
      ageOfHouse: ['', [Validators.required, Validators.min(0)]],
      hasGarage: ['', [Validators.required]],
      hasGarden: ['', [Validators.required]],
      floor: ['', [Validators.required]],
      buildingType: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Test API connection on component initialization
    this.mlService.testConnection().subscribe({
      next: (response) => console.log('API connection successful:', response),
      error: (error) => console.error('API connection failed:', error)
    });
  }

  onSubmit(): void {
    if (this.predictionForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.predictionResult = null;

      const formData: PredictionInput = {
        ...this.predictionForm.value,
        hasGarage: this.predictionForm.value.hasGarage ? 1 : 0,
        hasGarden: this.predictionForm.value.hasGarden ? 1 : 0
      };

      this.mlService.predict(formData).subscribe({
        next: (response) => {
          if (response.success && response.Predicted_Price !== undefined) {
            this.predictionResult = response.Predicted_Price;
          } else {
            this.errorMessage = response.message || 'Prediction failed';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred while making the prediction';
          this.isLoading = false;
        }
      });
    }
  }
} 