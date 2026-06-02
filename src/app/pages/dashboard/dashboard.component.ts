import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AlertService } from '../../services/alert.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { Alert } from '../../models/alert.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    equipment$!: Observable<Equipment[]>;
    alerts$!: Observable<Alert[]>;
    stats = {
        total: 0,
        operational: 0,
        warning: 0,
        critical: 0,
        unreadAlerts: 0
    };

    constructor(
        private equipmentService: EquipmentService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.equipment$ = this.equipmentService.getAll();
        this.alerts$ = this.alertService.getAlerts();

        this.equipment$.subscribe(equipment => {
            this.stats.total = equipment.length;
            this.stats.operational = equipment.filter(e => e.status === EquipmentStatus.OPERATIONAL).length;
            this.stats.warning = equipment.filter(e => e.status === EquipmentStatus.WARNING).length;
            this.stats.critical = equipment.filter(e => e.status === EquipmentStatus.CRITICAL).length;
        });

        this.alertService.getUnreadCount().subscribe(count => {
            this.stats.unreadAlerts = count;
        });
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
}
