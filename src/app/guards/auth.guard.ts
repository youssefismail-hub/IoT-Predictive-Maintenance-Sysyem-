import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getCurrentUser().pipe(
        take(1),
        map(user => {
            if (user) {
                if (user.isActive) {
                    return true;
                } else {
                    authService.logout();
                    router.navigate(['/login']);
                    return false;
                }
            } else {
                router.navigate(['/login']);
                return false;
            }
        })
    );
};
