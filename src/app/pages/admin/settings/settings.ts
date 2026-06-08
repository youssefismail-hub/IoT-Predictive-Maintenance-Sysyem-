import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  private firestore = inject(Firestore);

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      criticalTemperature: [80, [Validators.required, Validators.min(0)]],
      maxVibration: [5.0, [Validators.required, Validators.min(0)]],
      simulationFrequencyMs: [5000, [Validators.required, Validators.min(1000)]]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    const settingsDocRef = doc(this.firestore, 'settings/global');
    docData(settingsDocRef).subscribe({
      next: (data: any) => {
        if (data) {
          this.settingsForm.patchValue({
            criticalTemperature: data.criticalTemperature,
            maxVibration: data.maxVibration,
            simulationFrequencyMs: data.simulationFrequencyMs
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.loading = false;
      }
    });
  }

  async saveSettings() {
    if (this.settingsForm.valid) {
      this.saving = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      try {
        const settingsDocRef = doc(this.firestore, 'settings/global');
        await setDoc(settingsDocRef, this.settingsForm.value, { merge: true });
        this.successMessage = 'Settings saved successfully.';
      } catch (err: any) {
        console.error('Error saving settings', err);
        this.errorMessage = err.message || 'Failed to save settings.';
      } finally {
        this.saving = false;
      }
    }
  }
}
