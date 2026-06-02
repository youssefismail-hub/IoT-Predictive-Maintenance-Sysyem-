import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, query, orderBy } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Equipment } from '../models/equipment.model';

@Injectable({
    providedIn: 'root'
})
export class EquipmentService {
    private equipmentCollection;

    constructor(private firestore: Firestore) {
        this.equipmentCollection = collection(this.firestore, 'equipment');
    }

    getAll(): Observable<Equipment[]> {
        const q = query(this.equipmentCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }).pipe(
            map((items: any[]) => items.map((item: any) => ({
                ...item,
                createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt,
                updatedAt: item.updatedAt?.toDate ? item.updatedAt.toDate() : item.updatedAt,
                lastMaintenance: item.lastMaintenance?.toDate ? item.lastMaintenance.toDate() : item.lastMaintenance,
                nextMaintenance: item.nextMaintenance?.toDate ? item.nextMaintenance.toDate() : item.nextMaintenance
            } as Equipment)))
        ) as Observable<Equipment[]>;
    }

    async getById(id: string): Promise<Equipment | null> {
        try {
            const equipmentDoc = await getDoc(doc(this.firestore, `equipment/${id}`));
            if (equipmentDoc.exists()) {
                const data = equipmentDoc.data();
                console.log('Raw equipment data from Firestore:', data);
                
                // Helper function to convert Firestore Timestamp to Date
                const toDate = (value: any): Date | undefined => {
                    if (!value) return undefined;
                    if (value.toDate && typeof value.toDate === 'function') {
                        return value.toDate();
                    }
                    if (value instanceof Date) {
                        return value;
                    }
                    if (typeof value === 'string' || typeof value === 'number') {
                        return new Date(value);
                    }
                    return undefined;
                };

                const equipment: Equipment = {
                    id: equipmentDoc.id,
                    name: data['name'] || '',
                    type: data['type'] || '',
                    status: data['status'] || 'operational',
                    location: data['location'] || '',
                    temperature: data['temperature'] || 0,
                    vibration: data['vibration'] || 0,
                    lastMaintenance: toDate(data['lastMaintenance']),
                    nextMaintenance: toDate(data['nextMaintenance']),
                    createdAt: toDate(data['createdAt']) || new Date(),
                    updatedAt: toDate(data['updatedAt']) || new Date()
                };
                
                console.log('Processed equipment:', equipment);
                return equipment;
            }
            console.log('Equipment document does not exist for id:', id);
            return null;
        } catch (error) {
            console.error('Error fetching equipment:', error);
            throw error;
        }
    }

    async add(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const newEquipment: any = {
                ...equipment,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Convertir les dates JavaScript en Timestamp Firestore
            if (newEquipment.lastMaintenance instanceof Date) {
                newEquipment.lastMaintenance = Timestamp.fromDate(newEquipment.lastMaintenance);
            }
            if (newEquipment.nextMaintenance instanceof Date) {
                newEquipment.nextMaintenance = Timestamp.fromDate(newEquipment.nextMaintenance);
            }

            const docRef = await addDoc(this.equipmentCollection, newEquipment);
            return docRef.id;
        } catch (error) {
            console.error('Error adding equipment:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<Equipment>): Promise<void> {
        try {
            const updateData: any = {
                ...data,
                updatedAt: Timestamp.now()
            };

            // Convertir les dates JavaScript en Timestamp Firestore
            if (updateData.lastMaintenance instanceof Date) {
                updateData.lastMaintenance = Timestamp.fromDate(updateData.lastMaintenance);
            }
            if (updateData.nextMaintenance instanceof Date) {
                updateData.nextMaintenance = Timestamp.fromDate(updateData.nextMaintenance);
            }

            await updateDoc(doc(this.firestore, `equipment/${id}`), updateData);
        } catch (error) {
            console.error('Error updating equipment:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await deleteDoc(doc(this.firestore, `equipment/${id}`));
        } catch (error) {
            console.error('Error deleting equipment:', error);
            throw error;
        }
    }
}
