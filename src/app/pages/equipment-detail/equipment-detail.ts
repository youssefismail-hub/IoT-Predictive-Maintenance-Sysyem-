import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { Chart, registerables } from 'chart.js';
import { Firestore, collection, query, where, orderBy, limit, onSnapshot } from '@angular/fire/firestore';

Chart.register(...registerables);

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss',
})
export class EquipmentDetailComponent implements OnInit {
  equipment: Equipment | null = null;
  loading = false;
  error = '';
  equipmentStatus = EquipmentStatus;
  showDeleteConfirm = false;
  
  @ViewChild('sensorChart') chartRef!: ElementRef;
  private chart: Chart | null = null;
  private unsubscribeSnapshot: any;
  private firestore = inject(Firestore);

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEquipment(id);
    }
  }

  async loadEquipment(id: string) {
    try {
      this.loading = true;
      this.error = '';
      this.equipment = null;
      this.cdr.detectChanges(); // Force la détection de changement
      
      console.log('Loading equipment with id:', id);
      this.equipment = await this.equipmentService.getById(id);
      console.log('Equipment loaded:', this.equipment);
      
      if (this.equipment) {
        this.setupChart();
      }
      
      if (!this.equipment) {
        this.error = 'Équipement non trouvé';
      }
    } catch (error: any) {
      this.error = error.message || 'Erreur lors du chargement de l\'équipement';
      console.error('Error loading equipment:', error);
      this.equipment = null;
    } finally {
      this.loading = false;
      console.log('Final state - loading:', this.loading, 'equipment:', this.equipment, 'error:', this.error);
      this.cdr.detectChanges(); // Force la détection de changement après le chargement
    }
  }

  async deleteEquipment() {
    if (!this.equipment) return;

    try {
      this.loading = true;
      await this.equipmentService.delete(this.equipment.id);
      this.router.navigate(['/equipment']);
    } catch (error: any) {
      this.error = error.message || 'Erreur lors de la suppression';
      console.error('Error deleting equipment:', error);
      this.showDeleteConfirm = false;
    } finally {
      this.loading = false;
    }
  }

  getStatusClass(status: EquipmentStatus): string {
    const classes: Record<EquipmentStatus, string> = {
      [EquipmentStatus.OPERATIONAL]: 'badge-success',
      [EquipmentStatus.WARNING]: 'badge-warning',
      [EquipmentStatus.CRITICAL]: 'badge-danger',
      [EquipmentStatus.OFFLINE]: 'badge-secondary'
    };
    return classes[status];
  }

  getStatusLabel(status: EquipmentStatus): string {
    const labels: Record<EquipmentStatus, string> = {
      [EquipmentStatus.OPERATIONAL]: 'Opérationnel',
      [EquipmentStatus.WARNING]: 'Avertissement',
      [EquipmentStatus.CRITICAL]: 'Critique',
      [EquipmentStatus.OFFLINE]: 'Hors ligne'
    };
    return labels[status];
  }

  getTemperatureClass(temperature: number): string {
    if (temperature >= 100) return 'value-danger';
    if (temperature >= 70) return 'value-warning';
    return 'value-success';
  }

  getVibrationClass(vibration: number): string {
    if (vibration >= 80) return 'value-danger';
    if (vibration >= 50) return 'value-warning';
    return 'value-success';
  }

  getTemperaturePercentage(temperature: number): number {
    // Normaliser entre -50 et 150°C
    return Math.min(100, Math.max(0, ((temperature + 50) / 200) * 100));
  }

  formatDate(date: Date | undefined | null): string {
    if (!date) return 'Non défini';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return 'Date invalide';
      }
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date invalide';
    }
  }

  getDaysUntilMaintenance(nextMaintenance: Date | undefined | null): number | null {
    if (!nextMaintenance) return null;
    try {
      const today = new Date();
      const next = nextMaintenance instanceof Date ? nextMaintenance : new Date(nextMaintenance);
      if (isNaN(next.getTime())) {
        return null;
      }
      const diffTime = next.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until maintenance:', error);
      return null;
    }
  }

  getMaintenanceStatusClass(days: number | null): string {
    if (days === null) return '';
    if (days < 0) return 'maintenance-overdue';
    if (days <= 7) return 'maintenance-urgent';
    if (days <= 30) return 'maintenance-warning';
    return 'maintenance-ok';
  }

  getMaintenanceMessage(nextMaintenance: Date | undefined): string {
    const days = this.getDaysUntilMaintenance(nextMaintenance);
    if (days === null) return '';
    if (days > 0) {
      return `Dans ${days} jours`;
    } else {
      return `En retard de ${Math.abs(days)} jours`;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  setupChart() {
    if (!this.equipment) return;

    // Use a small timeout to ensure the canvas element is rendered
    setTimeout(() => {
      if (!this.chartRef) return;
      
      const ctx = this.chartRef.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Température (°C)',
              data: [],
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            },
            {
              label: 'Vibration (%)',
              data: [],
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      this.subscribeToReadings();
    }, 100);
  }

  subscribeToReadings() {
    if (!this.equipment) return;
    
    const readingsRef = collection(this.firestore, 'sensor-readings');
    const q = query(
      readingsRef, 
      where('equipmentId', '==', this.equipment.id),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const readings: any[] = [];
      snapshot.forEach((doc) => {
        readings.push(doc.data());
      });
      
      // Reverse to chronological order (oldest first for the chart left-to-right)
      readings.reverse();

      if (this.chart) {
        this.chart.data.labels = readings.map(r => {
          const d = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
          return d.toLocaleTimeString();
        });
        this.chart.data.datasets[0].data = readings.map(r => r.temperature);
        this.chart.data.datasets[1].data = readings.map(r => r.vibration);
        this.chart.update();
      }
    });
  }
}
