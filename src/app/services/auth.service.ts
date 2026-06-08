import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword as createUserWithEmailAndPasswordSecondary } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { Observable, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private injector = inject(Injector);
    user$: Observable<FirebaseUser | null>;

    constructor() {
        this.user$ = user(this.auth);
    }

    async register(email: string, password: string, name: string, role: Role = Role.TECHNICIAN): Promise<void> {
        try {
            const credential = await runInInjectionContext(this.injector, () => 
                createUserWithEmailAndPassword(this.auth, email, password)
            );
            const userDoc: User = {
                uid: credential.user.uid,
                email: email,
                name: name,
                role: role,
                isActive: true,
                createdAt: new Date()
            };

            await setDoc(doc(this.firestore, `users/${credential.user.uid}`), userDoc);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async registerSecondary(email: string, password: string, name: string, role: Role = Role.TECHNICIAN): Promise<void> {
        try {
            let secondaryApp: FirebaseApp;
            const apps = getApps();
            const appName = 'temp-register';
            const foundApp = apps.find(app => app.name === appName);
            
            if (foundApp) {
                secondaryApp = foundApp;
            } else {
                secondaryApp = initializeApp(environment.firebase, appName);
            }

            const secondaryAuth = getAuth(secondaryApp);
            const credential = await createUserWithEmailAndPasswordSecondary(secondaryAuth, email, password);
            
            const userDoc: User = {
                uid: credential.user.uid,
                email: email,
                name: name,
                role: role,
                isActive: true,
                createdAt: new Date()
            };

            await setDoc(doc(this.firestore, `users/${credential.user.uid}`), userDoc);
            
            // Sign out of the secondary app
            await secondaryAuth.signOut();
        } catch (error) {
            console.error('Registration (Secondary) error:', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<void> {
        try {
            await runInInjectionContext(this.injector, () => 
                signInWithEmailAndPassword(this.auth, email, password)
            );
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await runInInjectionContext(this.injector, () => signOut(this.auth));
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    getCurrentUser(): Observable<User | null> {
        return this.user$.pipe(
            switchMap((firebaseUser: FirebaseUser | null) => {
                if (!firebaseUser) {
                    return of(null);
                }
                
                const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
                return runInInjectionContext(this.injector, () => {
                    return docData(userDocRef, { idField: 'uid' }).pipe(
                        map((userData: any) => {
                            if (userData) {
                                return {
                                    ...userData,
                                    createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt
                                } as User;
                            }
                            return null;
                        })
                    );
                });
            })
        );
    }
}
