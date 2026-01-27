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
      hasGarage: [false],
      hasGarden: [false],
      floor: ['', [Validators.required]],
      buildingType: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Test API connection on component initialization
    this.mlService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ API bağlantısı başarılı:', response);
      },
      error: (error) => {
        console.warn('⚠️ API bağlantısı başarısız. Flask API\'nin çalıştığından emin olun:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.predictionForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.predictionResult = null;

      const formData: PredictionInput = {
        squareFeet: Number(this.predictionForm.value.squareFeet),
        numBedrooms: Number(this.predictionForm.value.numBedrooms),
        numBathrooms: Number(this.predictionForm.value.numBathrooms),
        location: Number(this.predictionForm.value.location),
        ageOfHouse: Number(this.predictionForm.value.ageOfHouse),
        hasGarage: this.predictionForm.value.hasGarage ? 1 : 0,
        hasGarden: this.predictionForm.value.hasGarden ? 1 : 0,
        floor: Number(this.predictionForm.value.floor),
        buildingType: Number(this.predictionForm.value.buildingType)
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
          if (error.status === 0) {
            this.errorMessage = 'API sunucusuna bağlanılamıyor. Lütfen Flask API\'nin çalıştığından emin olun (http://localhost:5000)';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = `Sunucu hatası: ${error.error.error}`;
          } else {
            this.errorMessage = 'Tahmin yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
          }
          this.isLoading = false;
        }
      });
    }
  }
} 