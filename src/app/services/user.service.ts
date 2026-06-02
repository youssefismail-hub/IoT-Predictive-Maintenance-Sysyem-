import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private usersCollection;

    constructor(private firestore: Firestore) {
        this.usersCollection = collection(this.firestore, 'users');
    }

    getAllUsers(): Observable<User[]> {
        const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'uid' }).pipe(
            map((items: any[]) => items.map((item: any) => ({
                ...item,
                createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt
            } as User)))
        ) as Observable<User[]>;
    }

    async getUserById(uid: string): Promise<User | null> {
        try {
            const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    uid: userDoc.id,
                    ...data,
                    createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : data['createdAt']
                } as User;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async updateUser(uid: string, data: Partial<User>): Promise<void> {
        try {
           
            const { createdAt, ...updateData } = data;
            await updateDoc(doc(this.firestore, `users/${uid}`), { ...updateData });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async updateRole(uid: string, role: Role): Promise<void> {
        try {
            await updateDoc(doc(this.firestore, `users/${uid}`), { role });
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    async deleteUser(uid: string): Promise<void> {
        try {
            
            await updateDoc(doc(this.firestore, `users/${uid}`), { isActive: false });
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
