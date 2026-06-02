import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss',
})
export class EquipmentFormComponent implements OnInit {
  equipmentForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  equipmentId: string | null = null;
  equipmentStatus = EquipmentStatus;

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.equipmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required]],
      status: [EquipmentStatus.OPERATIONAL, [Validators.required]],
      location: ['', [Validators.required]],
      temperature: [0, [Validators.required, Validators.min(-50), Validators.max(150)]],
      vibration: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      lastMaintenance: [''],
      nextMaintenance: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.equipmentId = id;
      this.loadEquipment(id);
    }
  }

  async loadEquipment(id: string) {
    try {
      this.loading = true;
      const equipment = await this.equipmentService.getById(id);
      if (equipment) {
        this.equipmentForm.patchValue({
          name: equipment.name,
          type: equipment.type,
          status: equipment.status,
          location: equipment.location,
          temperature: equipment.temperature,
          vibration: equipment.vibration,
          lastMaintenance: equipment.lastMaintenance ? this.formatDateForInput(equipment.lastMaintenance) : '',
          nextMaintenance: equipment.nextMaintenance ? this.formatDateForInput(equipment.nextMaintenance) : ''
        });
      } else {
        this.error = 'Équipement non trouvé';
      }
    } catch (error: any) {
      this.error = 'Erreur lors du chargement de l\'équipement';
      console.error('Error loading equipment:', error);
    } finally {
      this.loading = false;
    }
  }

  formatDateForInput(date: Date | any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async onSubmit() {
    if (this.equipmentForm.valid) {
      this.loading = true;
      this.error = '';

      try {
        const formValue = this.equipmentForm.value;
        const equipmentData = {
          name: formValue.name,
          type: formValue.type,
          status: formValue.status,
          location: formValue.location,
          temperature: Number(formValue.temperature),
          vibration: Number(formValue.vibration),
          lastMaintenance: formValue.lastMaintenance ? new Date(formValue.lastMaintenance) : undefined,
          nextMaintenance: formValue.nextMaintenance ? new Date(formValue.nextMaintenance) : undefined
        };

        if (this.isEditMode && this.equipmentId) {
          await this.equipmentService.update(this.equipmentId, equipmentData);
        } else {
          await this.equipmentService.add(equipmentData);
        }

        this.router.navigate(['/equipment']);
      } catch (error: any) {
        this.error = error.message || 'Une erreur est survenue. Veuillez réessayer.';
        console.error('Error saving equipment:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  get name() { return this.equipmentForm.get('name'); }
  get type() { return this.equipmentForm.get('type'); }
  get status() { return this.equipmentForm.get('status'); }
  get location() { return this.equipmentForm.get('location'); }
  get temperature() { return this.equipmentForm.get('temperature'); }
  get vibration() { return this.equipmentForm.get('vibration'); }
  get lastMaintenance() { return this.equipmentForm.get('lastMaintenance'); }
  get nextMaintenance() { return this.equipmentForm.get('nextMaintenance'); }
}
