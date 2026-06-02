import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { Alert, AlertSeverity, AlertType } from '../../models/alert.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class AlertsComponent implements OnInit {
  alerts$!: Observable<Alert[]>;
  filteredAlerts$!: Observable<Alert[]>;
  unreadCount$!: Observable<number>;
  
  severityFilter: AlertSeverity | 'all' = 'all';
  readFilter: 'all' | 'unread' | 'read' = 'all';
  
  AlertSeverity = AlertSeverity;
  AlertType = AlertType;
  
  loading = false;
  error = '';

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alerts$ = this.alertService.getAlerts();
    this.unreadCount$ = this.alertService.getUnreadCount();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAlerts$ = this.alerts$.pipe(
      map(alerts => {
        let filtered = alerts;

        // Filtrer par sévérité
        if (this.severityFilter !== 'all') {
          filtered = filtered.filter(alert => alert.severity === this.severityFilter);
        }

        // Filtrer par statut de lecture
        if (this.readFilter === 'unread') {
          filtered = filtered.filter(alert => !alert.isRead);
        } else if (this.readFilter === 'read') {
          filtered = filtered.filter(alert => alert.isRead);
        }

        return filtered;
      })
    );
  }

  onSeverityFilterChange() {
    this.applyFilters();
  }

  onReadFilterChange() {
    this.applyFilters();
  }

  async markAsRead(alert: Alert) {
    if (alert.isRead) return;
    
    try {
      this.loading = true;
      await this.alertService.markAsRead(alert.id);
    } catch (error: any) {
      this.error = 'Erreur lors du marquage de l\'alerte';
      console.error('Error marking alert as read:', error);
    } finally {
      this.loading = false;
    }
  }

  getSeverityLabel(severity: AlertSeverity): string {
    const labels: Record<AlertSeverity, string> = {
      [AlertSeverity.INFO]: 'Information',
      [AlertSeverity.WARNING]: 'Avertissement',
      [AlertSeverity.CRITICAL]: 'Critique'
    };
    return labels[severity] || severity;
  }

  getTypeLabel(type: AlertType): string {
    const labels: Record<AlertType, string> = {
      [AlertType.TEMPERATURE]: 'Température',
      [AlertType.VIBRATION]: 'Vibration',
      [AlertType.PRESSURE]: 'Pression',
      [AlertType.MAINTENANCE]: 'Maintenance',
      [AlertType.SYSTEM]: 'Système'
    };
    return labels[type] || type;
  }

  getSeverityClass(severity: AlertSeverity): string {
    const classes: Record<AlertSeverity, string> = {
      [AlertSeverity.INFO]: 'badge-info',
      [AlertSeverity.WARNING]: 'badge-warning',
      [AlertSeverity.CRITICAL]: 'badge-danger'
    };
    return classes[severity] || 'badge-secondary';
  }

  async markAllAsRead() {
    try {
      this.loading = true;
      const alerts = await this.alerts$.pipe(
        map(alerts => alerts.filter(a => !a.isRead))
      ).toPromise();
      
      if (alerts) {
        for (const alert of alerts) {
          await this.alertService.markAsRead(alert.id);
        }
      }
    } catch (error: any) {
      this.error = 'Erreur lors du marquage des alertes';
      console.error('Error marking all alerts as read:', error);
    } finally {
      this.loading = false;
    }
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }
}
