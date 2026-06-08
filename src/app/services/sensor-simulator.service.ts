import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { EquipmentService } from './equipment.service';
import { PredictionService, PredictionInput, PredictionResult } from './prediction.service';
import { AlertService } from './alert.service';
import { Equipment, EquipmentStatus } from '../models/equipment.model';
import { AlertType, AlertSeverity } from '../models/alert.model';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface SimulationLog {
  timestamp: Date;
  equipmentName: string;
  input: PredictionInput;
  result: PredictionResult;
  status: 'normal' | 'failure';
}

@Injectable({
  providedIn: 'root'
})
export class SensorSimulatorService {
  private isRunningSubject = new BehaviorSubject<boolean>(false);
  isRunning$ = this.isRunningSubject.asObservable();

  private lastLogSubject = new BehaviorSubject<SimulationLog | null>(null);
  lastLog$ = this.lastLogSubject.asObservable();

  private intervalId: any = null;
  private readonly SIMULATION_INTERVAL_MS = 25000; // 25 seconds interval to avoid rate limiting

  private firestore = inject(Firestore);

  constructor(
    private equipmentService: EquipmentService,
    private predictionService: PredictionService,
    private alertService: AlertService
  ) {}

  /**
   * Starts the simulation loop
   */
  startSimulation() {
    if (this.isRunningSubject.value) return;

    this.isRunningSubject.next(true);
    console.log('IoT Simulator started');

    // Run first iteration immediately
    this.runSimulationIteration();

    // Set interval for subsequent runs
    this.intervalId = setInterval(() => {
      this.runSimulationIteration();
    }, this.SIMULATION_INTERVAL_MS);
  }

  /**
   * Stops the simulation loop
   */
  stopSimulation() {
    if (!this.isRunningSubject.value) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunningSubject.next(false);
    console.log('IoT Simulator stopped');
  }

  /**
   * Executes a single simulation iteration
   */
  private async runSimulationIteration() {
    try {
      // Get all equipment
      const equipments = await firstValueFrom(this.equipmentService.getAll());
      if (!equipments || equipments.length === 0) {
        console.warn('No equipment found in Firestore to simulate.');
        return;
      }

      // Pick one equipment at random
      const targetEquipment = equipments[Math.floor(Math.random() * equipments.length)];
      
      // Check if API is currently online or waking up. If offline, don't execute to avoid spamming errors.
      const apiStatus = await firstValueFrom(this.predictionService.apiStatus$);
      if (apiStatus === 'offline') {
        console.warn('ML API is offline. Skipping simulator iteration.');
        return;
      }

      // Generate simulated telemetry data
      const input = this.generateTelemetry(targetEquipment);

      // Query prediction API
      this.predictionService.getPrediction(input).subscribe({
        next: async (result) => {
          let updatedStatus = EquipmentStatus.OPERATIONAL;
          const isFailure = result.failure === 1;

          if (isFailure) {
            updatedStatus = EquipmentStatus.CRITICAL;
          } else if (result.failure_probability > 0.35) {
            updatedStatus = EquipmentStatus.WARNING;
          }

          // Update equipment in Firestore
          await this.equipmentService.update(targetEquipment.id, {
            airTemp: parseFloat(input.air_temp.toFixed(2)),
            temperature: parseFloat(input.process_temp.toFixed(2)), // Process temp maps to temperature in UI
            rotationalSpeed: Math.round(input.rotational_speed),
            torque: parseFloat(input.torque.toFixed(2)),
            toolWear: parseFloat(input.tool_wear.toFixed(2)),
            status: updatedStatus,
            failureProbability: result.failure_probability,
            failureType: result.failure_type !== null ? result.failure_type : undefined
          });

          // Log historical reading in Firestore
          await addDoc(collection(this.firestore, 'sensor-readings'), {
            equipmentId: targetEquipment.id,
            temperature: parseFloat(input.process_temp.toFixed(2)),
            vibration: parseFloat(input.torque.toFixed(2)),
            pressure: Math.round(input.rotational_speed / 10),
            timestamp: new Date()
          });

          // Log the simulation event
          const log: SimulationLog = {
            timestamp: new Date(),
            equipmentName: targetEquipment.name,
            input,
            result,
            status: isFailure ? 'failure' : 'normal'
          };
          this.lastLogSubject.next(log);

          // If failure is predicted, spawn a system alert in Firestore
          if (isFailure) {
            const failureName = this.predictionService.getFailureTypeName(result.failure_type);
            await this.alertService.createAlert({
              equipmentId: targetEquipment.id,
              equipmentName: targetEquipment.name,
              message: `Maintenance Prédictive : Panne imminente de type "${failureName}" détectée par IA (Probabilité : ${(result.failure_probability * 100).toFixed(1)}%)`,
              type: AlertType.SYSTEM,
              severity: AlertSeverity.CRITICAL,
              isRead: false
            });
            console.log(`Predictive failure alert created for ${targetEquipment.name}`);
          }
        },
        error: (err) => {
          console.error(`Simulation iteration failed for ${targetEquipment.name}:`, err);
        }
      });
    } catch (error) {
      console.error('Error running simulation iteration:', error);
    }
  }

  /**
   * Generates realistic telemetry values, with a small probability of spawning an anomaly.
   */
  private generateTelemetry(eq: Equipment): PredictionInput {
    const hasAnomaly = Math.random() < 0.15; // 15% chance of simulating anomaly variables

    // Baseline variables
    let air_temp = 293 + Math.random() * 8; // Ambient: ~20°C to ~28°C in Kelvin (293K to 301K)
    let process_temp = air_temp + 10 + Math.random() * 5; // Normal difference: ~10K to 15K higher
    let rotational_speed = 1350 + Math.random() * 400; // Normal RPM: 1350 - 1750
    let torque = 35 + Math.random() * 20; // Normal torque: 35 - 55 Nm
    
    // Gradual tool wear increment
    let currentWear = eq.toolWear !== undefined ? eq.toolWear : 0;
    let tool_wear = currentWear + 1 + Math.random() * 3; // Wears out by 1-4 mins per simulation cycle
    if (tool_wear > 240) {
      tool_wear = 0; // Reset wear when it exceeds standard lifecycle
    }

    if (hasAnomaly) {
      // Simulate one of the anomaly types to trigger the ML models
      const anomalyType = Math.floor(Math.random() * 4);
      switch (anomalyType) {
        case 0: // Heat Dissipation Anomaly (process-air difference too low but speed/torque high)
          air_temp = 302 + Math.random() * 2;
          process_temp = air_temp + 6; // low temp diff
          rotational_speed = 1300 + Math.random() * 100;
          torque = 52 + Math.random() * 5;
          break;
        case 1: // Power Anomaly (RPM * torque product is extreme, or too low)
          torque = 68 + Math.random() * 10; // high torque
          rotational_speed = 2600 + Math.random() * 200; // very high RPM
          break;
        case 2: // Overstrain Anomaly (wear * torque is extremely high)
          tool_wear = 205 + Math.random() * 30; // heavy wear
          torque = 60 + Math.random() * 10;     // high torque
          break;
        case 3: // Tool Wear Anomaly (extreme wear alone)
          tool_wear = 230 + Math.random() * 15;
          break;
      }
    }

    return {
      air_temp,
      process_temp,
      rotational_speed,
      torque,
      tool_wear
    };
  }
}
