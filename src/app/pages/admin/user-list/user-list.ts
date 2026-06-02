import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  users$!: Observable<User[]>;
  loading = false;
  error = '';
  deleteConfirmId: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users$ = this.userService.getAllUsers();
  }

  async deleteUser(uid: string) {
    try {
      this.loading = true;
      await this.userService.deleteUser(uid);
      this.deleteConfirmId = null;
      this.loadUsers();
    } catch (error: any) {
      this.error = error.message || 'Erreur lors de la suppression de l\'utilisateur';
      console.error('Error deleting user:', error);
      this.deleteConfirmId = null;
    } finally {
      this.loading = false;
    }
  }

  getRoleLabel(role: Role): string {
    return role === Role.ADMIN ? 'Administrateur' : 'Technicien';
  }

  getRoleClass(role: Role): string {
    return role === Role.ADMIN ? 'badge-danger' : 'badge-info';
  }

  formatDate(date: Date | any): string {
    if (!date) return 'Non défini';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
