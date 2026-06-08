import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, timeout, tap } from 'rxjs/operators';

export interface PredictionInput {
  air_temp: number;
  process_temp: number;
  rotational_speed: number;
  torque: number;
  tool_wear: number;
}

export interface PredictionResult {
  failure_probability: number;
  failure: number; // 0 or 1
  failure_type: number | null; 
}

export type ApiStatus = 'checking' | 'online' | 'waking_up' | 'offline';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'https://predictive-maintenance-api-laim.onrender.com';
  
  private apiStatusSubject = new BehaviorSubject<ApiStatus>('checking');
  apiStatus$ = this.apiStatusSubject.asObservable();
  
  private lastPingTimeSubject = new BehaviorSubject<number | null>(null);
  lastPingTime$ = this.lastPingTimeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkApiHealth();
  }


  checkApiHealth(): Observable<boolean> {
    this.apiStatusSubject.next('checking');
    const startTime = Date.now();
    
    return this.http.get<{ message: string }>(`${this.apiUrl}/`).pipe(
      timeout(8000), // If GET / takes > 8 seconds, it's likely sleeping and waking up
      map(res => {
        const duration = Date.now() - startTime;
        this.lastPingTimeSubject.next(duration);
        this.apiStatusSubject.next('online');
        console.log(`ML API is Online. Ping: ${duration}ms`);
        return true;
      }),
      catchError((error: any) => {
        const duration = Date.now() - startTime;
        this.lastPingTimeSubject.next(null);
        
        if (error.name === 'TimeoutError' || error.status === 0 || error.status === 504) {
          // Timeout or gateway timeout: typically means Render is spinning up the container
          this.apiStatusSubject.next('waking_up');
          console.warn(`ML API is waking up (spinning up container). Duration elapsed: ${duration}ms`);
          
          // Poll again after 15 seconds to check if it has woken up
          setTimeout(() => this.checkApiHealth().subscribe(), 15000);
        } else {
          this.apiStatusSubject.next('offline');
          console.error('ML API is Offline or unreachable:', error);
        }
        return of(false);
      })
    );
  }


  getPrediction(data: PredictionInput): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, data).pipe(
      tap(() => {
        // If it succeeds, ensure we mark the API as online
        if (this.apiStatusSubject.value !== 'online') {
          this.apiStatusSubject.next('online');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('ML Prediction request failed:', error);
        if (error.status === 0 || error.status === 504 || error.status === 502) {
          this.apiStatusSubject.next('waking_up');
        }
        return throwError(() => new Error(error.message || 'API ML non disponible'));
      })
    );
  }


  getFailureTypeName(type: number | null | undefined): string {
    if (type === null || type === undefined) return 'Aucune défaillance';
    const names = [
      'Aucune défaillance',
      'Usure d\'outil (TWF)',
      'Dissipation thermique (HDF)',
      'Puissance électrique (PWF)',
      'Surcharge mécanique (OSF)',
      'Défaillance aléatoire (RNF)'
    ];
    return type >= 0 && type < names.length ? names[type] : `Autre type (${type})`;
  }
}
