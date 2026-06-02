import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Role } from './models/role.model';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'equipment',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/equipment-list/equipment-list').then(m => m.EquipmentListComponent)
            },
            {
                path: 'new',
                loadComponent: () => import('./pages/equipment-form/equipment-form').then(m => m.EquipmentFormComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('./pages/equipment-detail/equipment-detail').then(m => m.EquipmentDetailComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./pages/equipment-form/equipment-form').then(m => m.EquipmentFormComponent)
            }
        ]
    },
    {
        path: 'alerts',
        loadComponent: () => import('./pages/alerts/alerts').then(m => m.AlertsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard([Role.ADMIN])],
        children: [
            {
                path: 'users',
                loadComponent: () => import('./pages/admin/user-list/user-list').then(m => m.UserListComponent)
            },
            {
                path: 'users/new',
                loadComponent: () => import('./pages/admin/user-form/user-form').then(m => m.UserFormComponent)
            },
            {
                path: 'users/:id/edit',
                loadComponent: () => import('./pages/admin/user-form/user-form').then(m => m.UserFormComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/admin/settings/settings').then(m => m.SettingsComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
