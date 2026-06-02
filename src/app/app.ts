import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  currentUser$: Observable<User | null> = of(null);
  showNav = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    try {
      this.currentUser$ = this.authService.getCurrentUser().pipe(
        catchError(error => {
          console.error('Error getting current user:', error);
          return of(null);
        })
      );
      this.currentUser$.subscribe({
        next: user => {
          this.showNav = !!user;
        },
        error: error => {
          console.error('Error in user subscription:', error);
          this.showNav = false;
        }
      });
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showNav = false;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}
