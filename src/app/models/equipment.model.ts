export interface Equipment {
    id: string;
    name: string;
    type: string;
    status: EquipmentStatus;
    location: string;
    temperature: number;
    vibration: number;
    airTemp?: number;
    rotationalSpeed?: number;
    torque?: number;
    toolWear?: number;
    failureProbability?: number;
    failureType?: number;
    lastMaintenance?: Date;
    nextMaintenance?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum EquipmentStatus {
    OPERATIONAL = 'operational',
    WARNING = 'warning',
    CRITICAL = 'critical',
    OFFLINE = 'offline'
}
