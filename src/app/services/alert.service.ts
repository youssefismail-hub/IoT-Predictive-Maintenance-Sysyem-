import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, query, where, orderBy, Timestamp, addDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private alertsCollection;

    constructor(private firestore: Firestore) {
        this.alertsCollection = collection(this.firestore, 'alerts');
    }

    getAlerts(): Observable<Alert[]> {
        const q = query(this.alertsCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }).pipe(
            map((items: any[]) => items.map((item: any) => {
                // Convertir les Timestamps Firestore en Date
                let createdAt: Date;
                if (item.createdAt?.toDate) {
                    createdAt = item.createdAt.toDate();
                } else if (item.createdAt instanceof Date) {
                    createdAt = item.createdAt;
                } else if (item.createdAt) {
                    createdAt = new Date(item.createdAt);
                } else {
                    createdAt = new Date();
                }

                return {
                    id: item.id || '',
                    equipmentId: item.equipmentId || '',
                    equipmentName: item.equipmentName || '',
                    message: item.message || '',
                    type: item.type || 'system',
                    severity: item.severity || 'info',
                    isRead: item.isRead || false,
                    createdAt: createdAt
                } as Alert;
            }))
        ) as Observable<Alert[]>;
    }

    getUnreadCount(): Observable<number> {
        return this.getAlerts().pipe(
            map(alerts => alerts.filter(alert => !alert.isRead).length)
        );
    }

    async markAsRead(id: string): Promise<void> {
        try {
            await updateDoc(doc(this.firestore, `alerts/${id}`), { isRead: true });
        } catch (error) {
            console.error('Error marking alert as read:', error);
            throw error;
        }
    }

    async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
        try {
            const newAlert = {
                ...alert,
                createdAt: Timestamp.now()
            };
            const docRef = await addDoc(this.alertsCollection, newAlert);
            return docRef.id;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }
}
