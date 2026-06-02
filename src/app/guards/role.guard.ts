import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Role } from '../models/role.model';

export const roleGuard = (allowedRoles: Role[]) => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        return authService.getCurrentUser().pipe(
            map(user => {
                if (user && allowedRoles.includes(user.role)) {
                    return true;
                } else {
                    router.navigate(['/dashboard']);
                    return false;
                }
            })
        );
    };
};
