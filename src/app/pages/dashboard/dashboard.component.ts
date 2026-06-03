import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AlertService } from '../../services/alert.service';
import { PredictionService, ApiStatus } from '../../services/prediction.service';
import { SensorSimulatorService, SimulationLog } from '../../services/sensor-simulator.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { Alert } from '../../models/alert.model';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    equipment$!: Observable<Equipment[]>;
    alerts$!: Observable<Alert[]>;
    stats = {
        total: 0,
        operational: 0,
        warning: 0,
        critical: 0,
        unreadAlerts: 0
    };

    apiStatus: ApiStatus = 'checking';
    lastPingTime: number | null = null;
    simulatorRunning = false;
    lastLog: SimulationLog | null = null;
    
    private subs = new Subscription();

    constructor(
        private equipmentService: EquipmentService,
        private alertService: AlertService,
        private predictionService: PredictionService,
        private simulatorService: SensorSimulatorService
    ) { }

    ngOnInit() {
        this.equipment$ = this.equipmentService.getAll();
        this.alerts$ = this.alertService.getAlerts();

        this.subs.add(
            this.equipment$.subscribe(equipment => {
                this.stats.total = equipment.length;
                this.stats.operational = equipment.filter(e => e.status === EquipmentStatus.OPERATIONAL).length;
                this.stats.warning = equipment.filter(e => e.status === EquipmentStatus.WARNING).length;
                this.stats.critical = equipment.filter(e => e.status === EquipmentStatus.CRITICAL).length;
            })
        );

        this.subs.add(
            this.alertService.getUnreadCount().subscribe(count => {
                this.stats.unreadAlerts = count;
            })
        );

        // Subscribe to API status updates
        this.subs.add(
            this.predictionService.apiStatus$.subscribe(status => {
                this.apiStatus = status;
            })
        );

        // Subscribe to API response latency ping times
        this.subs.add(
            this.predictionService.lastPingTime$.subscribe(ping => {
                this.lastPingTime = ping;
            })
        );

        // Subscribe to simulator state
        this.subs.add(
            this.simulatorService.isRunning$.subscribe(running => {
                this.simulatorRunning = running;
            })
        );

        // Subscribe to simulator telemetry logs
        this.subs.add(
            this.simulatorService.lastLog$.subscribe(log => {
                this.lastLog = log;
            })
        );
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    toggleSimulator() {
        if (this.simulatorRunning) {
            this.simulatorService.stopSimulation();
        } else {
            this.simulatorService.startSimulation();
        }
    }

    checkApiHealth() {
        this.predictionService.checkApiHealth().subscribe();
    }

    getFailureTypeName(type: number | null | undefined): string {
        return this.predictionService.getFailureTypeName(type);
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
