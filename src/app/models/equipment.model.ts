export interface Equipment {
    id: string;
    name: string;
    type: string;
    status: EquipmentStatus;
    location: string;
    temperature: number;
    vibration: number;
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
