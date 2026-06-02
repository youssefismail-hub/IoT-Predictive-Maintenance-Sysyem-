export interface Alert {
    id: string;
    equipmentId: string;
    equipmentName?: string;
    message: string;
    type: AlertType;
    severity: AlertSeverity;
    isRead: boolean;
    createdAt: Date;
}

export enum AlertType {
    TEMPERATURE = 'temperature',
    VIBRATION = 'vibration',
    PRESSURE = 'pressure',
    MAINTENANCE = 'maintenance',
    SYSTEM = 'system'
}

export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical'
}
